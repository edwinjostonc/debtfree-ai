import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

const shots = [
  { url: "http://localhost:3000", file: "/tmp/ss_landing.png", wait: 1000 },
  { url: "http://localhost:3000/login", file: "/tmp/ss_login.png", wait: 500 },
  { url: "http://localhost:3000/register", file: "/tmp/ss_register.png", wait: 500 },
];

for (const { url, file, wait } of shots) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`Done: ${file}`);
}

// Mobile landing
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/ss_landing_mobile.png", fullPage: false });
console.log("Done: /tmp/ss_landing_mobile.png");

await browser.close();
