/**
 * 마라톤온라인 (roadrun.co.kr) 크롤러
 * 국내 마라톤 대회 일정 정보 수집
 *
 * 사용법:
 *   npx tsx scripts/crawlers/marathon-online.ts          # 크롤링만 (미리보기)
 *   npx tsx scripts/crawlers/marathon-online.ts --save   # 크롤링 + Supabase 저장
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
  phone: string | null;
  source: string;
}

// 대회 일정 페이지 크롤링
async function crawlSchedulePage(): Promise<RaceInfo[]> {
  console.log("🏃 마라톤온라인 대회일정 크롤링 시작...\n");

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
    console.log("📅 대회 일정 페이지 접속 중...");
    await page.goto("http://roadrun.co.kr/schedule/list.php", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    // 대회 정보 추출
    const raceData = await page.evaluate(() => {
      const races: {
        date: string;
        name: string;
        distance: string;
        location: string;
        organizer: string;
        phone: string;
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

            // 대회명에서 종목 분리
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

            // 주최와 전화번호 분리
            const phoneMatch = organizerCell.match(/☎\s*([\d-]+)/);
            const phone = phoneMatch ? phoneMatch[1] : "";
            const organizer = organizerCell.replace(/☎\s*[\d-]+/, "").trim();

            races.push({
              date: dateText,
              name: name || fullName,
              distance: distance,
              location: location,
              organizer: organizer,
              phone: phone,
              link: nameLink?.href || null,
            });
          }
        }
      });

      return races;
    });

    console.log(`📊 추출된 대회 수: ${raceData.length}`);

    const currentYear = new Date().getFullYear();

    // 데이터 변환
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
          phone: row.phone || null,
          source: "roadrun.co.kr",
        });
      }
    }

    // 결과 출력
    console.log("\n📋 추출된 대회 목록:");
    console.log("-".repeat(80));
    races.forEach((race, i) => {
      console.log(`${i + 1}. ${race.name}`);
      console.log(`   📅 ${race.date} | 📍 ${race.location}`);
      console.log(`   🏃 ${race.distance} | 🏢 ${race.organizer}`);
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
    console.log("   NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요합니다.");
    return { inserted: 0, skipped: 0, failed: 0 };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`\n💾 Supabase에 ${races.length}개 대회 저장 중...`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const race of races) {
    try {
      // 중복 체크 (이름 + 날짜로)
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

      // 새 대회 추가
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
      console.error(`❌ 오류 (${race.name}):`, e);
      failed++;
    }
  }

  console.log(
    `\n📊 저장 결과: ✅ ${inserted}개 추가, ⏭️ ${skipped}개 중복, ❌ ${failed}개 실패`
  );
  return { inserted, skipped, failed };
}

// JSON 파일로 저장
async function saveToJson(races: RaceInfo[]) {
  const fs = await import("fs");
  const path = await import("path");

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `races_${timestamp}.json`;
  const outputDir = path.join(process.cwd(), "scripts/crawlers/data");

  // 폴더 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(races, null, 2), "utf-8");

  console.log(`\n💾 JSON 파일 저장 완료: ${filepath}`);
  return filepath;
}

// 메인 실행
async function main() {
  const args = process.argv.slice(2);
  const shouldSave = args.includes("--save");
  const shouldSaveJson = args.includes("--json");

  console.log("=".repeat(60));
  console.log("🏃 마라톤 대회 크롤러 v1.0");
  console.log("   소스: roadrun.co.kr (마라톤온라인)");
  console.log("=".repeat(60));

  const races = await crawlSchedulePage();

  console.log(`\n📊 총 ${races.length}개 대회 수집 완료`);

  if (shouldSaveJson) {
    await saveToJson(races);
  } else if (shouldSave) {
    await saveToSupabase(races);
  } else {
    console.log("\n💡 저장 옵션:");
    console.log("   --json  : JSON 파일로 저장");
    console.log("   --save  : Supabase에 저장");
    console.log("   예: npx tsx scripts/crawlers/marathon-online.ts --json");
  }

  console.log("\n✅ 크롤링 완료!");
}

main().catch(console.error);
