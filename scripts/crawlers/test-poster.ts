/**
 * 포스터 이미지 크롤링 테스트 스크립트
 * 각 사이트의 대회 상세 페이지에서 포스터 이미지를 찾습니다.
 */

import { chromium } from "playwright";

async function testPosterCrawling() {
  console.log("🔍 포스터 이미지 크롤링 테스트 시작...\n");

  const browser = await chromium.launch({ headless: false }); // headless: false로 브라우저 확인
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  // 1. roadrun.co.kr 테스트
  console.log("📍 [1/2] roadrun.co.kr 테스트...");
  const page1 = await context.newPage();

  try {
    // 대회 상세 페이지 접근
    await page1.goto("http://roadrun.co.kr/schedule/view.php?no=41182", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page1.waitForTimeout(2000);

    // 스크린샷 저장
    await page1.screenshot({
      path: "scripts/crawlers/screenshots/roadrun_detail.png",
      fullPage: true
    });
    console.log("   📸 스크린샷 저장: roadrun_detail.png");

    // 모든 이미지 태그 찾기
    const images = await page1.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      return Array.from(imgs).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height,
        className: img.className,
      }));
    });

    console.log(`   🖼️ 발견된 이미지: ${images.length}개`);
    images.forEach((img, i) => {
      console.log(`      ${i + 1}. ${img.src}`);
      console.log(`         크기: ${img.width}x${img.height}, alt: ${img.alt || "(없음)"}`);
    });

  } catch (error) {
    console.error("   ❌ 오류:", error);
  } finally {
    await page1.close();
  }

  // 2. gorunning.kr 테스트
  console.log("\n📍 [2/2] gorunning.kr 테스트...");
  const page2 = await context.newPage();

  try {
    await page2.goto("https://gorunning.kr/races/798/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page2.waitForTimeout(2000);

    // 스크린샷 저장
    await page2.screenshot({
      path: "scripts/crawlers/screenshots/gorunning_detail.png",
      fullPage: true
    });
    console.log("   📸 스크린샷 저장: gorunning_detail.png");

    // 모든 이미지 태그 찾기
    const images = await page2.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      return Array.from(imgs).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height,
        className: img.className,
      }));
    });

    console.log(`   🖼️ 발견된 이미지: ${images.length}개`);
    images.forEach((img, i) => {
      console.log(`      ${i + 1}. ${img.src}`);
      console.log(`         크기: ${img.width}x${img.height}, alt: ${img.alt || "(없음)"}`);
    });

    // 배경 이미지도 확인
    const bgImages = await page2.evaluate(() => {
      const elements = document.querySelectorAll("*");
      const bgImgs: string[] = [];

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== "none" && bgImage.includes("url")) {
          bgImgs.push(bgImage);
        }
      });

      return bgImgs;
    });

    if (bgImages.length > 0) {
      console.log(`   🎨 배경 이미지: ${bgImages.length}개`);
      bgImages.forEach((bg, i) => {
        console.log(`      ${i + 1}. ${bg}`);
      });
    }

  } catch (error) {
    console.error("   ❌ 오류:", error);
  } finally {
    await page2.close();
  }

  await browser.close();
  console.log("\n✅ 테스트 완료!");
}

testPosterCrawling().catch(console.error);