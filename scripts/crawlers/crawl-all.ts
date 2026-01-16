/**
 * 통합 마라톤 대회 크롤러
 * 여러 소스에서 대회 정보를 수집하여 Supabase에 저장
 *
 * 사용법:
 *   npx tsx scripts/crawlers/crawl-all.ts          # 모든 소스 크롤링 (미리보기)
 *   npx tsx scripts/crawlers/crawl-all.ts --save   # 크롤링 + Supabase 저장
 *
 * 소스 목록:
 *   - roadrun.co.kr (마라톤온라인)
 *   - gorunning.kr (고러닝)
 */

import { chromium, Browser, BrowserContext } from "playwright";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

interface RaceInfo {
  name: string;
  date: string;
  location: string;
  distance: string;
  registration_url: string | null;
  organizer: string | null;
  source: string;
}

// ========================================
// 마라톤온라인 (roadrun.co.kr) 크롤러
// ========================================
async function crawlRoadRun(context: BrowserContext): Promise<RaceInfo[]> {
  console.log("\n📍 [1/2] 마라톤온라인 크롤링...");

  const page = await context.newPage();
  const races: RaceInfo[] = [];

  try {
    await page.goto("http://roadrun.co.kr/schedule/list.php", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    const raceData = await page.evaluate(() => {
      const races: {
        date: string;
        name: string;
        distance: string;
        location: string;
        organizer: string;
        link: string | null;
      }[] = [];

      const rows = document.querySelectorAll("tr");

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");

        if (cells.length >= 4) {
          const firstCellText = cells[0]?.textContent?.trim() || "";
          const isDateCell = /^\d{1,2}\/\d{1,2}/.test(firstCellText);

          if (isDateCell) {
            const dateText = firstCellText;
            const nameCell = cells[1];
            const nameLink = nameCell?.querySelector("a");
            const fullName = nameCell?.textContent?.trim() || "";
            const location = cells[2]?.textContent?.trim() || "";
            const organizerCell = cells[3]?.textContent?.trim() || "";

            let name = fullName;
            let distance = "";

            const distancePatterns =
              /(풀코스|하프코스|풀|하프|울트라|\d+\.?\d*\s*km|\d+\.?\d*\s*K)/gi;
            const matches = fullName.match(distancePatterns);

            if (matches) {
              const firstMatch = fullName.search(distancePatterns);
              if (firstMatch > 0) {
                name = fullName.substring(0, firstMatch).trim();
                distance = fullName.substring(firstMatch).trim();
              }
            }

            const organizer = organizerCell.replace(/☎\s*[\d-]+/, "").trim();

            races.push({
              date: dateText,
              name: name || fullName,
              distance: distance,
              location: location,
              organizer: organizer,
              link: nameLink?.href || null,
            });
          }
        }
      });

      return races;
    });

    const currentYear = new Date().getFullYear();

    for (const row of raceData) {
      const dateMatch = row.date.match(/(\d{1,2})\/(\d{1,2})/);
      let formattedDate = "";

      if (dateMatch) {
        const [, month, day] = dateMatch;
        const monthNum = parseInt(month);
        const currentMonth = new Date().getMonth() + 1;
        const year = monthNum < currentMonth ? currentYear + 1 : currentYear;
        formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      if (formattedDate && row.name) {
        races.push({
          name: row.name,
          date: formattedDate,
          location: row.location,
          distance: row.distance,
          registration_url: row.link,
          organizer: row.organizer || null,
          source: "roadrun.co.kr",
        });
      }
    }

    console.log(`   ✅ ${races.length}개 대회 수집`);
  } catch (error) {
    console.error("   ❌ 오류:", error);
  } finally {
    await page.close();
  }

  return races;
}

// ========================================
// 고러닝 (gorunning.kr) 크롤러
// ========================================
async function crawlGoRunning(context: BrowserContext): Promise<RaceInfo[]> {
  console.log("\n📍 [2/2] 고러닝 크롤링...");

  const page = await context.newPage();
  const races: RaceInfo[] = [];

  try {
    await page.goto("https://gorunning.kr/races/", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    await page.waitForTimeout(5000);

    // 날짜 헤더와 대회 카드 구조 기반 추출
    const raceData = await page.evaluate(() => {
      const races: {
        date: string;
        name: string;
        distance: string;
        link: string | null;
      }[] = [];

      // 날짜 헤더 찾기 (H3 태그, "01월 18일 (일)" 형식)
      const dateHeaders = document.querySelectorAll("h3");

      dateHeaders.forEach((header) => {
        const headerText = header.textContent?.trim() || "";
        const dateMatch = headerText.match(/(\d{1,2})월\s*(\d{1,2})일/);

        if (dateMatch) {
          const dateStr = `${dateMatch[1]}월 ${dateMatch[2]}일`;

          // 해당 날짜 헤더 다음의 대회 카드들 찾기
          let sibling = header.nextElementSibling;

          while (sibling && sibling.tagName !== "H3") {
            // 대회 카드: mb-2 flex justify-between items-start 클래스를 가진 div
            const cards = sibling.querySelectorAll("div.mb-2");

            cards.forEach((card) => {
              const link = card.querySelector("a");
              const href = link?.href || null;
              const text = card.textContent?.trim() || "";

              if (href && href.includes("/races/") && text.length > 5) {
                // 대회명 추출 (첫 번째 줄)
                const lines = text.split("\n").map(l => l.trim()).filter(l => l);
                const name = lines[0] || "";

                // 거리 추출
                const distanceMatch = text.match(/(풀코스|하프|울트라|\d+\.?\d*\s*[kK][mM]|\d+\.?\d*K)/gi);
                const distance = distanceMatch ? [...new Set(distanceMatch)].join(", ") : "";

                if (name && !name.includes("대회를 주최하시나요")) {
                  races.push({
                    date: dateStr,
                    name: name,
                    distance: distance,
                    link: href,
                  });
                }
              }
            });

            sibling = sibling.nextElementSibling;
          }
        }
      });

      return races;
    });

    console.log(`   📊 1차 추출: ${raceData.length}개`);

    const currentYear = new Date().getFullYear();
    const seenRaces = new Set<string>();

    for (const row of raceData) {
      let formattedDate = "";

      const shortDateMatch = row.date.match(/(\d{1,2})월\s*(\d{1,2})일/);

      if (shortDateMatch) {
        const month = shortDateMatch[1].padStart(2, "0");
        const day = shortDateMatch[2].padStart(2, "0");
        const monthNum = parseInt(shortDateMatch[1]);
        const currentMonth = new Date().getMonth() + 1;
        const year = monthNum < currentMonth ? currentYear + 1 : currentYear;
        formattedDate = `${year}-${month}-${day}`;
      }

      if (formattedDate && row.name) {
        const key = `${row.name}-${formattedDate}`;
        if (!seenRaces.has(key)) {
          seenRaces.add(key);
          races.push({
            name: row.name,
            date: formattedDate,
            location: "",
            distance: row.distance,
            registration_url: row.link,
            organizer: null,
            source: "gorunning.kr",
          });
        }
      }
    }

    console.log(`   ✅ ${races.length}개 대회 수집`);
  } catch (error) {
    console.error("   ❌ 오류:", error);
  } finally {
    await page.close();
  }

  return races;
}

// ========================================
// JSON 파일 저장
// ========================================
async function saveToJson(races: RaceInfo[]) {
  const fs = await import("fs");
  const path = await import("path");

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `races_all_${timestamp}.json`;
  const outputDir = path.join(process.cwd(), "scripts/crawlers/data");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(races, null, 2), "utf-8");

  console.log(`\n💾 JSON 파일 저장 완료: ${filepath}`);
  return filepath;
}

// ========================================
// Supabase 저장
// ========================================
async function saveToSupabase(races: RaceInfo[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("\n⚠️ Supabase 환경변수가 없어 저장을 건너뜁니다.");
    return { inserted: 0, skipped: 0, failed: 0 };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`\n💾 Supabase에 ${races.length}개 대회 저장 중...`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const race of races) {
    try {
      const { data: existing } = await supabase
        .from("races")
        .select("id")
        .eq("name", race.name)
        .eq("date", race.date)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const { error } = await supabase.from("races").insert({
        name: race.name,
        date: race.date,
        location: race.location,
        distance: race.distance,
        registration_url: race.registration_url,
        organizer: race.organizer,
      });

      if (error) {
        if (failed < 3) {
          console.error(`   ❌ 저장 실패 (${race.name}):`, error.message);
        }
        failed++;
      } else {
        inserted++;
      }
    } catch (e) {
      failed++;
    }
  }

  console.log(`\n📊 저장 결과:`);
  console.log(`   ✅ ${inserted}개 추가`);
  console.log(`   ⏭️  ${skipped}개 중복 (스킵)`);
  console.log(`   ❌ ${failed}개 실패`);

  return { inserted, skipped, failed };
}

// ========================================
// 메인 실행
// ========================================
async function main() {
  const args = process.argv.slice(2);
  const shouldSave = args.includes("--save");
  const shouldSaveJson = args.includes("--json");

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║          🏃 통합 마라톤 대회 크롤러 v1.0                  ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║  소스: roadrun.co.kr, gorunning.kr                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const allRaces: RaceInfo[] = [];

  try {
    // 각 소스에서 크롤링
    const roadRunRaces = await crawlRoadRun(context);
    allRaces.push(...roadRunRaces);

    const goRunningRaces = await crawlGoRunning(context);
    allRaces.push(...goRunningRaces);

    // 중복 제거 (이름 + 날짜 기준)
    const uniqueRaces = new Map<string, RaceInfo>();
    for (const race of allRaces) {
      const key = `${race.name}-${race.date}`;
      if (!uniqueRaces.has(key)) {
        uniqueRaces.set(key, race);
      }
    }

    const finalRaces = Array.from(uniqueRaces.values());

    console.log("\n" + "═".repeat(60));
    console.log(`📊 총 ${finalRaces.length}개 대회 수집 (중복 제거 후)`);
    console.log("═".repeat(60));

    // 미리보기 출력
    console.log("\n📋 수집된 대회 목록 (상위 20개):");
    console.log("-".repeat(60));
    finalRaces.slice(0, 20).forEach((race, i) => {
      console.log(`${i + 1}. ${race.name} (${race.source})`);
      console.log(`   📅 ${race.date} | 🏃 ${race.distance || "미정"}`);
    });

    if (finalRaces.length > 20) {
      console.log(`\n   ... 외 ${finalRaces.length - 20}개`);
    }

    // 저장
    if (shouldSaveJson) {
      await saveToJson(finalRaces);
    } else if (shouldSave) {
      await saveToSupabase(finalRaces);
    } else {
      console.log("\n💡 저장 옵션:");
      console.log("   --json  : JSON 파일로 저장");
      console.log("   --save  : Supabase에 저장");
      console.log("   예: npx tsx scripts/crawlers/crawl-all.ts --json");
    }

  } finally {
    await browser.close();
  }

  console.log("\n✅ 크롤링 완료!");
}

main().catch(console.error);
