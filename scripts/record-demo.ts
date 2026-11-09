import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const outputDir = path.join(process.cwd(), "submission", "video", "capture");

async function main() {
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: outputDir,
    size: { width: 1920, height: 1080 },
  },
});

const page = await context.newPage();
const hold = (milliseconds: number) => page.waitForTimeout(milliseconds);

await page.goto(baseUrl, { waitUntil: "networkidle" });
await hold(8500);
await page.evaluate(() => window.scrollTo({ top: 620, behavior: "smooth" }));
await hold(4500);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
await hold(2500);

await page.getByRole("link", { name: /Launch Flagship Demo/i }).click();
await page.waitForLoadState("networkidle");
await hold(7000);

await page.getByRole("button", { name: /Load Canonical Demo Request/i }).click();
await hold(3500);
await page.getByRole("button", { name: /Extract Rights Scope with AI/i }).click();
await page.getByText(/Extraction complete/i).waitFor({ timeout: 30000 });
await hold(9000);

await page.evaluate(() => window.scrollTo({ top: 760, behavior: "smooth" }));
await hold(6000);
await page.evaluate(() => window.scrollTo({ top: 1420, behavior: "smooth" }));
await hold(8500);

const commercialCard = page.locator("div.rounded-xl").filter({ hasText: "Commercial Social" }).first();
await commercialCard.getByRole("button", { name: /Settle License \(Fixture Mode\)/i }).click();
await page.waitForURL(/\/receipt\//, { timeout: 30000 });
await page.waitForLoadState("networkidle");
await hold(9000);

await page.evaluate(() => window.scrollTo({ top: 650, behavior: "smooth" }));
await hold(5000);
await page.getByRole("button", { name: /Tamper Price to \$0\.00/i }).click();
await hold(5500);
await page.getByRole("button", { name: /Restore Authentic State/i }).click();
await hold(4500);

await page.getByRole("link", { name: /View in Control Room/i }).click();
await page.waitForLoadState("networkidle");
await hold(8000);
await page.evaluate(() => window.scrollTo({ top: 520, behavior: "smooth" }));
await hold(6500);

const fixtureFilter = page.getByRole("button", { name: "FIXTURE", exact: true });
if (await fixtureFilter.isVisible()) {
  await fixtureFilter.click();
  await hold(5000);
}

await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
await hold(4500);

const video = page.video();
if (!video) {
  throw new Error("Playwright did not produce a video artifact.");
}

const finalPath = path.join(process.cwd(), "submission", "video", "ownterms-demo-raw.webm");
await fs.mkdir(path.dirname(finalPath), { recursive: true });
await page.close();
await video.saveAs(finalPath);
await context.close();
await browser.close();
console.log(finalPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
