import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const screenshotsDir = path.join(process.cwd(), "docs", "screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe("OwnTerms - Canonical Hackathon Demo Journey (FIXTURE Mode)", () => {
  test("completes end-to-end journey across 1440x900 desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Visit Home Catalog
    await page.goto("/");
    await expect(page).toHaveTitle(/OwnTerms/);
    await expect(page.locator("h1")).toContainText("Your agent can use it—");

    // Verify local demo asset image is loaded and visible
    const heroImage = page.locator("img[alt='Night Market Signals']").first();
    await expect(heroImage).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, "01-home-catalog-1440.png") });

    // Click on Flagship Demo Asset
    await page.click("text=Launch Flagship Demo");
    await expect(page).toHaveURL(/.*\/assets\/asset_night_market_01/);

    // 2. Asset Detail & Intent Studio
    await expect(page.locator("h1")).toContainText("Night Market Signals");
    await expect(page.getByText("Mira Rao (Demo Persona)")).toBeVisible();

    // Verify canonical prompt is loaded
    const textarea = page.locator("textarea#intent-prompt");
    await expect(textarea).toHaveValue(/paid Instagram campaign/);

    // Click "Extract Rights Scope with AI"
    const extractBtn = page.locator("button:has-text('Extract Rights Scope with AI')");
    await extractBtn.click();

    // Wait for extracted facts chips
    await expect(page.getByText(/Channels:/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Duration: 30 days/)).toBeVisible();
    await expect(page.getByText(/Territories: IN, SG/)).toBeVisible();
    await expect(page.getByText(/Commercial: Yes/)).toBeVisible();
    await expect(page.getByText(/AI Training: Prohibited/)).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, "02-extracted-facts-1440.png") });

    // 3. Verify Policy Compatibility Rail
    await expect(page.getByText("Editorial Only", { exact: true })).toBeVisible();
    await expect(page.getByText("Commercial Social", { exact: true })).toBeVisible();
    await expect(page.getByText("Extended Campaign", { exact: true })).toBeVisible();

    // Check Optimal Match badge on Commercial Social
    const commercialCard = page.locator("div.rounded-xl").filter({ hasText: "Commercial Social" }).first();
    await expect(commercialCard).toContainText("Optimal Match");
    await expect(commercialCard).toContainText("$69.00");
    await page.screenshot({ path: path.join(screenshotsDir, "03-policy-matrix-1440.png") });

    // 4. Execute Fixture Checkout
    const payBtn = commercialCard.locator("button:has-text('Settle License')");
    await payBtn.click();

    // 5. Verify Navigation to Verifiable Rights Receipt
    await expect(page).toHaveURL(/.*\/receipt\/rcpt_/, { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Machine-Readable Rights Receipt");
    await expect(page.getByText("Cryptographic Integrity Verified")).toBeVisible();
    await expect(page.getByText("$69.00")).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, "04-rights-receipt-1440.png") });

    // 6. Test Interactive Anti-Tamper Sandbox
    const tamperPriceBtn = page.locator("button:has-text('Tamper Price to $0.00')");
    await tamperPriceBtn.click();
    await expect(page.getByText("Cryptographic Tampering Detected!")).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, "05-tamper-detected-1440.png") });

    const restoreBtn = page.locator("button:has-text('Restore Authentic State')");
    await restoreBtn.click();
    await expect(page.getByText("Cryptographic Integrity Verified")).toBeVisible();

    // 7. Visit Creator Control Room
    await page.click("text=View in Control Room");
    await expect(page).toHaveURL(/.*\/control-room/);
    await expect(page.locator("h1")).toContainText("Creator Rights & Revenue Control Room");

    // Verify Custom "Rights Coverage" Matrix Widget is present
    await expect(page.getByText("Rights Coverage Matrix")).toBeVisible();
    await expect(page.getByText("Channel \\ Region")).toBeVisible();
    await expect(page.getByText("Instagram Ads").first()).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "India (IN)" })).toBeVisible();

    // Verify AG Grid table is loaded
    await expect(page.locator(".ag-root")).toBeVisible();
    await expect(page.locator(".ag-cell:has-text('Night Market Signals')").first()).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, "06-control-room-1440.png") });
  });

  test("verifies responsive presentation on 1280x720 laptop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/assets/asset_night_market_01");
    await expect(page.locator("h1")).toContainText("Night Market Signals");
    await page.screenshot({ path: path.join(screenshotsDir, "07-asset-detail-1280.png") });
  });

  test("verifies responsive mobile presentation on 390x844 mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Your agent can use it—");
    await page.screenshot({ path: path.join(screenshotsDir, "08-mobile-home-390.png") });

    await page.goto("/assets/asset_night_market_01");
    await expect(page.locator("h1")).toContainText("Night Market Signals");
    await page.screenshot({ path: path.join(screenshotsDir, "09-mobile-asset-390.png") });

    await page.goto("/control-room");
    await expect(page.locator("h1")).toContainText("Creator Rights & Revenue Control Room");
    await page.screenshot({ path: path.join(screenshotsDir, "10-mobile-control-room-390.png") });
  });
});
