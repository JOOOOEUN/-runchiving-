/**
 * 고러닝 (gorunning.kr) 크롤러
 * 국내 마라톤 대회 일정 정보 수집
 *
 * 사용법:
 *   npx tsx scripts/crawlers/gorunning.ts          # 크롤링만 (미리보기)
 *   npx tsx scripts/crawlers/gorunning.ts --save   # 크롤링 + Supabase 저장
 */

import { chromium } from "playwright";
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
  status: string | null;
  source: string;
}

async function crawlGoRunning(): Promise<RaceInfo[]> {
  console.log("🏃 고러닝 대회일정 크롤링 시작...\n");

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  const races: RaceInfo[] = [];

  try {
    console.log("📅 고러닝 페이지 접속 중...");
    await page.goto("https://gorunning.kr/races/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    // 대회 정보 추출
    const raceData = await page.evaluate(() => {
      const races: {
        date: string;
        name: string;
        distance: string;
        location: string;
        organizer: string;
        status: string;
        link: string | null;
      }[] = [];

      // 날짜 그룹별로 대회 찾기
      // 고러닝은 "01월 01일 (목)" 형태로 날짜가 표시됨
      const dateHeaders = document.querySelectorAll("h2, h3, h4, .date-header, [class*='date']");

      dateHeaders.forEach((header) => {
        const headerText = header.textContent?.trim() || "";
        // 날짜 패턴: "01월 01일" 또는 "2025년 01월"
        const dateMatch = headerText.match(/(\d{1,2})월\s*(\d{1,2})일/);

        if (dateMatch) {
          // 해당 날짜 아래의 대회들 찾기
          let sibling = header.nextElementSibling;
          while (sibling && !sibling.matches("h2, h3, h4, [class*='date']")) {
            const raceText = sibling.textContent || "";
            const link = sibling.querySelector("a")?.href || null;

            // 대회명 패턴
            const nameMatch = raceText.match(/[\w가-힣]+(?:마라톤|러닝|레이스|대회|런|챌린지|트레일)/);

            if (nameMatch) {
              // 거리 추출
              const distanceMatch = raceText.match(/(풀코스|하프|울트라|\d+\.?\d*\s*[kK][mM])/g);

              // 지역 추출
              const locationMatch = raceText.match(/지역:\s*([\w가-힣]+)/);

              // 주최 추출
              const organizerMatch = raceText.match(/주최:\s*([\w가-힣]+)/);

              // 상태 추출
              let status = "";
              if (raceText.includes("등록중")) status = "접수중";
              else if (raceText.includes("등록마감") || raceText.includes("마감")) status = "접수마감";
              else if (raceText.includes("등록예정")) status = "접수전";

              races.push({
                date: dateMatch[0],
                name: nameMatch[0],
                distance: distanceMatch ? [...new Set(distanceMatch)].join(", ") : "",
                location: locationMatch ? locationMatch[1] : "",
                organizer: organizerMatch ? organizerMatch[1] : "",
                status: status,
                link: link,
              });
            }

            sibling = sibling.nextElementSibling;
          }
        }
      });

      // 테이블 형식으로도 시도
      if (races.length === 0) {
        const rows = document.querySelectorAll("tr, .race-item, [class*='race'], article");

        rows.forEach((row) => {
          const text = row.textContent || "";
          const link = row.querySelector("a")?.href || null;

          // 대회명 패턴
          const nameMatch = text.match(/(?:제?\s*\d+\s*회\s*)?[\w가-힣]+(?:마라톤|러닝|레이스|대회|런|챌린지|트레일런)/);

          // 날짜 패턴
          const datePatterns = [
            /(\d{4})[-.](\d{1,2})[-.](\d{1,2})/,
            /(\d{1,2})월\s*(\d{1,2})일/,
          ];

          let dateStr = "";
          for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
              dateStr = match[0];
              break;
            }
          }

          if (nameMatch && dateStr) {
            const distanceMatch = text.match(/(풀코스|하프|울트라|\d+\.?\d*\s*[kK][mM])/g);

            let status = "";
            if (text.includes("등록중") || text.includes("접수중")) status = "접수중";
            else if (text.includes("등록마감") || text.includes("마감")) status = "접수마감";
            else if (text.includes("등록예정") || text.includes("접수전")) status = "접수전";

            races.push({
              date: dateStr,
              name: nameMatch[0],
              distance: distanceMatch ? [...new Set(distanceMatch)].join(", ") : "",
              location: "",
              organizer: "",
              status: status,
              link: link,
            });
          }
        });
      }

      return races;
    });

    console.log(`📊 1차 추출: ${raceData.length}개`);

    // 날짜 포맷 변환
    const currentYear = new Date().getFullYear();

    for (const row of raceData) {
      let formattedDate = "";

      // 2025-12-21 형식
      const fullDateMatch = row.date.match(/(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
      // 12월 21일 형식
      const shortDateMatch = row.date.match(/(\d{1,2})월\s*(\d{1,2})일/);

      if (fullDateMatch) {
        formattedDate = `${fullDateMatch[1]}-${fullDateMatch[2].padStart(2, "0")}-${fullDateMatch[3].padStart(2, "0")}`;
      } else if (shortDateMatch) {
        const month = shortDateMatch[1].padStart(2, "0");
        const day = shortDateMatch[2].padStart(2, "0");
        // 현재 월보다 작으면 내년
        const monthNum = parseInt(shortDateMatch[1]);
        const currentMonth = new Date().getMonth() + 1;
        const year = monthNum < currentMonth ? currentYear + 1 : currentYear;
        formattedDate = `${year}-${month}-${day}`;
      }

      if (formattedDate && row.name) {
        // 중복 체크
        const isDuplicate = races.some(r => r.name === row.name && r.date === formattedDate);
        if (!isDuplicate) {
          races.push({
            name: row.name,
            date: formattedDate,
            location: row.location,
            distance: row.distance,
            registration_url: row.link,
            organizer: row.organizer || null,
            status: row.status || null,
            source: "gorunning.kr",
          });
        }
      }
    }

    // 스크린샷 저장
    await page.screenshot({
      path: "./scripts/crawlers/screenshots/gorunning.png",
      fullPage: true,
    });

    // 결과 출력
    console.log(`\n📊 총 추출된 대회 수: ${races.length}`);
    console.log("\n📋 추출된 대회 목록:");
    console.log("-".repeat(80));
    races.slice(0, 20).forEach((race, i) => {
      console.log(`${i + 1}. ${race.name}`);
      console.log(`   📅 ${race.date} | 🏃 ${race.distance} | 📌 ${race.status || "상태미정"}`);
      console.log("");
    });

  } catch (error) {
    console.error("❌ 크롤링 오류:", error);
  } finally {
    await browser.close();
  }

  return races;
}

// Supabase에 저장
async function saveToSupabase(races: RaceInfo[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("⚠️ Supabase 환경변수가 없어 저장을 건너뜁니다.");
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
        console.error(`❌ 저장 실패 (${race.name}):`, error.message);
        failed++;
      } else {
        console.log(`✅ 저장: ${race.name}`);
        inserted++;
      }
    } catch (e) {
      failed++;
    }
  }

  console.log(`\n📊 저장 결과: ✅ ${inserted}개 추가, ⏭️ ${skipped}개 중복, ❌ ${failed}개 실패`);
  return { inserted, skipped, failed };
}

// JSON 파일로 저장
async function saveToJson(races: RaceInfo[]) {
  const fs = await import("fs");
  const path = await import("path");

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `races_gorunning_${timestamp}.json`;
  const outputDir = path.join(process.cwd(), "scripts/crawlers/data");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(races, null, 2), "utf-8");

  console.log(`\n💾 JSON 파일 저장 완료: ${filepath}`);
  return filepath;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldSave = args.includes("--save");
  const shouldSaveJson = args.includes("--json");

  console.log("=".repeat(60));
  console.log("🏃 고러닝 크롤러 v1.0");
  console.log("   소스: gorunning.kr");
  console.log("=".repeat(60));

  const races = await crawlGoRunning();

  console.log(`\n📊 총 ${races.length}개 대회 수집 완료`);

  if (shouldSaveJson && races.length > 0) {
    await saveToJson(races);
  } else if (shouldSave && races.length > 0) {
    await saveToSupabase(races);
  } else if (!shouldSave && !shouldSaveJson) {
    console.log("\n💡 저장 옵션:");
    console.log("   --json  : JSON 파일로 저장");
    console.log("   --save  : Supabase에 저장");
  }

  console.log("\n✅ 크롤링 완료!");
}

main().catch(console.error);
