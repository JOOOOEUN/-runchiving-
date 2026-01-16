/**
 * 고러닝 사이트 HTML 구조 분석
 */
import { chromium } from "playwright";

async function analyzeGoRunning() {
  console.log("🔍 고러닝 사이트 구조 분석 중...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    await page.goto("https://gorunning.kr/races/", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    await page.waitForTimeout(5000);

    // HTML 구조 분석
    const analysis = await page.evaluate(() => {
      const result: any = {
        title: document.title,
        url: window.location.href,
        dateHeaders: [],
        raceCards: [],
        allClasses: new Set<string>(),
      };

      // 날짜 헤더 찾기
      const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6, [class*='date'], [class*='day']");
      headers.forEach((h) => {
        const text = h.textContent?.trim() || "";
        if (text.match(/\d+월\s*\d+일/) || text.match(/\d{4}[-./]\d{1,2}[-./]\d{1,2}/)) {
          result.dateHeaders.push({
            tag: h.tagName,
            class: h.className,
            text: text.substring(0, 100),
          });
        }
      });

      // 대회 카드 찾기 (다양한 패턴 시도)
      const cardSelectors = [
        "[class*='race']",
        "[class*='event']",
        "[class*='card']",
        "[class*='item']",
        "article",
        ".grid > div",
        "a[href*='race']",
      ];

      cardSelectors.forEach((selector) => {
        const cards = document.querySelectorAll(selector);
        cards.forEach((card) => {
          const text = card.textContent?.trim() || "";
          if (text.length > 10 && text.length < 500) {
            // 대회 관련 키워드 포함 여부
            if (
              text.includes("마라톤") ||
              text.includes("러닝") ||
              text.includes("km") ||
              text.includes("K") ||
              text.includes("레이스")
            ) {
              result.raceCards.push({
                selector,
                tag: card.tagName,
                class: card.className,
                text: text.substring(0, 200),
                href: card instanceof HTMLAnchorElement ? card.href : card.querySelector("a")?.href,
              });
            }
          }
        });
      });

      // 모든 클래스 수집 (분석용)
      document.querySelectorAll("*").forEach((el) => {
        if (el.className && typeof el.className === "string") {
          el.className.split(" ").forEach((c) => {
            if (c) result.allClasses.add(c);
          });
        }
      });

      result.allClasses = Array.from(result.allClasses).filter(
        (c: string) =>
          c.includes("race") ||
          c.includes("event") ||
          c.includes("card") ||
          c.includes("date") ||
          c.includes("item") ||
          c.includes("list")
      );

      return result;
    });

    console.log("📊 분석 결과:\n");
    console.log("🔹 날짜 헤더:", analysis.dateHeaders.length, "개");
    analysis.dateHeaders.slice(0, 5).forEach((h: any, i: number) => {
      console.log(`   ${i + 1}. <${h.tag}> class="${h.class}" → "${h.text}"`);
    });

    console.log("\n🔹 대회 카드:", analysis.raceCards.length, "개");
    analysis.raceCards.slice(0, 10).forEach((c: any, i: number) => {
      console.log(`\n   ${i + 1}. [${c.selector}] <${c.tag}>`);
      console.log(`      class: ${c.class}`);
      console.log(`      text: ${c.text.substring(0, 100)}...`);
      if (c.href) console.log(`      href: ${c.href}`);
    });

    console.log("\n🔹 관련 클래스:", analysis.allClasses.slice(0, 20).join(", "));

    // 스크린샷 저장
    await page.screenshot({
      path: "./scripts/crawlers/screenshots/gorunning-analysis.png",
      fullPage: true,
    });
    console.log("\n📸 스크린샷 저장: gorunning-analysis.png");

  } catch (error) {
    console.error("❌ 오류:", error);
  } finally {
    await browser.close();
  }
}

analyzeGoRunning().catch(console.error);
