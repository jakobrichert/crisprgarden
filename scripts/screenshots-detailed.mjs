import { chromium } from "playwright";

const BASE = "http://localhost:3001";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const shots = [];

  function shot(name, fn) {
    shots.push({ name, fn });
  }

  // ── Homepage ──
  shot("homepage-hero", async (p) => {
    await p.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(800);
    await p.screenshot({ path: "screenshots/homepage-hero.png" });
  });

  shot("homepage-features", async (p) => {
    await p.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(500);
    await p.evaluate(() => window.scrollTo(0, 700));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/homepage-features.png" });
  });

  // ── Designer: load an example first, then capture sections ──
  shot("designer-input", async (p) => {
    await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: "screenshots/designer-input.png" });
  });

  shot("designer-results", async (p) => {
    await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    // Click an example sequence button if available
    const exampleBtn = p.locator("button", { hasText: /tomato|arabidopsis|rice|SlPDS|example/i }).first();
    if (await exampleBtn.isVisible().catch(() => false)) {
      await exampleBtn.click();
      await p.waitForTimeout(500);
    }
    // Click design/run button
    const designBtn = p.locator("button", { hasText: /design|find|run|analyze/i }).first();
    if (await designBtn.isVisible().catch(() => false)) {
      await designBtn.click();
      await p.waitForTimeout(2000);
    }
    // Scroll to results
    await p.evaluate(() => window.scrollTo(0, 500));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/designer-results.png" });
  });

  shot("designer-guide-table", async (p) => {
    await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    const exampleBtn = p.locator("button", { hasText: /tomato|arabidopsis|rice|SlPDS|example/i }).first();
    if (await exampleBtn.isVisible().catch(() => false)) {
      await exampleBtn.click();
      await p.waitForTimeout(500);
    }
    const designBtn = p.locator("button", { hasText: /design|find|run|analyze/i }).first();
    if (await designBtn.isVisible().catch(() => false)) {
      await designBtn.click();
      await p.waitForTimeout(2000);
    }
    await p.evaluate(() => window.scrollTo(0, 900));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/designer-guide-table.png" });
  });

  shot("designer-cut-site", async (p) => {
    await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    const exampleBtn = p.locator("button", { hasText: /tomato|arabidopsis|rice|SlPDS|example/i }).first();
    if (await exampleBtn.isVisible().catch(() => false)) {
      await exampleBtn.click();
      await p.waitForTimeout(500);
    }
    const designBtn = p.locator("button", { hasText: /design|find|run|analyze/i }).first();
    if (await designBtn.isVisible().catch(() => false)) {
      await designBtn.click();
      await p.waitForTimeout(2000);
    }
    await p.evaluate(() => window.scrollTo(0, 1400));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/designer-cut-site.png" });
  });

  shot("designer-3d-viewer", async (p) => {
    await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    const exampleBtn = p.locator("button", { hasText: /tomato|arabidopsis|rice|SlPDS|example/i }).first();
    if (await exampleBtn.isVisible().catch(() => false)) {
      await exampleBtn.click();
      await p.waitForTimeout(500);
    }
    const designBtn = p.locator("button", { hasText: /design|find|run|analyze/i }).first();
    if (await designBtn.isVisible().catch(() => false)) {
      await designBtn.click();
      await p.waitForTimeout(2000);
    }
    await p.evaluate(() => window.scrollTo(0, 1900));
    await p.waitForTimeout(1500);
    await p.screenshot({ path: "screenshots/designer-3d-viewer.png" });
  });

  shot("designer-offtargets", async (p) => {
    await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    const exampleBtn = p.locator("button", { hasText: /tomato|arabidopsis|rice|SlPDS|example/i }).first();
    if (await exampleBtn.isVisible().catch(() => false)) {
      await exampleBtn.click();
      await p.waitForTimeout(500);
    }
    const designBtn = p.locator("button", { hasText: /design|find|run|analyze/i }).first();
    if (await designBtn.isVisible().catch(() => false)) {
      await designBtn.click();
      await p.waitForTimeout(3000);
    }
    await p.evaluate(() => window.scrollTo(0, 2400));
    await p.waitForTimeout(1000);
    await p.screenshot({ path: "screenshots/designer-offtargets.png" });
  });

  shot("designer-primers", async (p) => {
    await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    const exampleBtn = p.locator("button", { hasText: /tomato|arabidopsis|rice|SlPDS|example/i }).first();
    if (await exampleBtn.isVisible().catch(() => false)) {
      await exampleBtn.click();
      await p.waitForTimeout(500);
    }
    const designBtn = p.locator("button", { hasText: /design|find|run|analyze/i }).first();
    if (await designBtn.isVisible().catch(() => false)) {
      await designBtn.click();
      await p.waitForTimeout(2000);
    }
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/designer-primers.png" });
  });

  // ── Genome Browser ──
  shot("genome-browser", async (p) => {
    await p.goto(`${BASE}/genome`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: "screenshots/genome-browser.png" });
  });

  // ── Learn CRISPR: 3D mechanism at different steps ──
  shot("learn-crispr-dna", async (p) => {
    await p.goto(`${BASE}/genome/learn`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(3000);
    await p.screenshot({ path: "screenshots/learn-crispr-3d.png" });
  });

  shot("learn-crispr-steps", async (p) => {
    await p.goto(`${BASE}/genome/learn`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(2500);
    // Click through steps if step buttons exist
    const stepBtns = p.locator("button", { hasText: /step|pam|guide|break|repair|next/i });
    const count = await stepBtns.count();
    if (count > 1) {
      await stepBtns.nth(1).click();
      await p.waitForTimeout(1500);
    }
    await p.screenshot({ path: "screenshots/learn-crispr-pam.png" });
  });

  shot("learn-crispr-cut", async (p) => {
    await p.goto(`${BASE}/genome/learn`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(2500);
    const stepBtns = p.locator("button", { hasText: /step|pam|guide|break|repair|cut|next/i });
    const count = await stepBtns.count();
    if (count > 2) {
      await stepBtns.nth(2).click();
      await p.waitForTimeout(1500);
      await p.screenshot({ path: "screenshots/learn-crispr-guide.png" });
    }
    if (count > 3) {
      await stepBtns.nth(3).click();
      await p.waitForTimeout(1500);
      await p.screenshot({ path: "screenshots/learn-crispr-cut.png" });
    }
    if (count > 4) {
      await stepBtns.nth(4).click();
      await p.waitForTimeout(1500);
      await p.screenshot({ path: "screenshots/learn-crispr-repair.png" });
    }
  });

  shot("learn-crispr-content", async (p) => {
    await p.goto(`${BASE}/genome/learn`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    await p.evaluate(() => window.scrollTo(0, 700));
    await p.waitForTimeout(1500);
    await p.screenshot({ path: "screenshots/learn-crispr-content.png" });
  });

  shot("learn-crispr-delivery", async (p) => {
    await p.goto(`${BASE}/genome/learn`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(500);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 900));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/learn-delivery-methods.png" });
  });

  // ── Protocols ──
  shot("protocols-grid", async (p) => {
    await p.goto(`${BASE}/protocols`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(800);
    await p.screenshot({ path: "screenshots/protocols-grid.png" });
  });

  // Protocol detail pages with 3D viz
  const protocols = [
    { slug: "dna-extraction", name: "protocol-dna-extraction" },
    { slug: "agrobacterium-transformation", name: "protocol-agrobacterium" },
    { slug: "protoplast-transformation", name: "protocol-protoplast" },
    { slug: "biolistics", name: "protocol-biolistics" },
    { slug: "pcr-screening", name: "protocol-pcr" },
    { slug: "callus-culture", name: "protocol-callus" },
  ];

  for (const proto of protocols) {
    // 3D visualization
    shot(`${proto.name}-3d`, async (p) => {
      await p.goto(`${BASE}/protocols/${proto.slug}`, { waitUntil: "networkidle", timeout: 15000 });
      await p.waitForTimeout(2500);
      await p.screenshot({ path: `screenshots/${proto.name}-3d.png` });
    });

    // Steps/procedure section
    shot(`${proto.name}-steps`, async (p) => {
      await p.goto(`${BASE}/protocols/${proto.slug}`, { waitUntil: "networkidle", timeout: 15000 });
      await p.waitForTimeout(1000);
      await p.evaluate(() => window.scrollTo(0, 800));
      await p.waitForTimeout(500);
      await p.screenshot({ path: `screenshots/${proto.name}-steps.png` });
    });
  }

  // ── Wizard ──
  shot("wizard-species", async (p) => {
    await p.goto(`${BASE}/wizard`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(800);
    await p.screenshot({ path: "screenshots/wizard-species.png" });
  });

  shot("wizard-tomato", async (p) => {
    await p.goto(`${BASE}/wizard/tomato`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: "screenshots/wizard-tomato.png" });
  });

  shot("wizard-tomato-targets", async (p) => {
    await p.goto(`${BASE}/wizard/tomato`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(800);
    await p.evaluate(() => window.scrollTo(0, 500));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/wizard-tomato-targets.png" });
  });

  shot("wizard-tomato-media", async (p) => {
    await p.goto(`${BASE}/wizard/tomato`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(800);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 900));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/wizard-tomato-media.png" });
  });

  shot("wizard-arabidopsis", async (p) => {
    await p.goto(`${BASE}/wizard/arabidopsis`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: "screenshots/wizard-arabidopsis.png" });
  });

  shot("wizard-rice", async (p) => {
    await p.goto(`${BASE}/wizard/rice`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: "screenshots/wizard-rice.png" });
  });

  // ── Experiments ──
  shot("experiments-empty", async (p) => {
    await p.goto(`${BASE}/experiments`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(800);
    await p.screenshot({ path: "screenshots/experiments.png" });
  });

  // ── Community ──
  shot("community-feed", async (p) => {
    await p.goto(`${BASE}/feed`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(800);
    await p.screenshot({ path: "screenshots/community-feed.png" });
  });

  // ── Dark mode variants ──
  shot("homepage-dark", async (p) => {
    await p.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(500);
    // Toggle dark mode
    await p.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/homepage-dark.png" });
  });

  shot("designer-dark", async (p) => {
    await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    await p.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    const exampleBtn = p.locator("button", { hasText: /tomato|arabidopsis|rice|SlPDS|example/i }).first();
    if (await exampleBtn.isVisible().catch(() => false)) {
      await exampleBtn.click();
      await p.waitForTimeout(500);
    }
    const designBtn = p.locator("button", { hasText: /design|find|run|analyze/i }).first();
    if (await designBtn.isVisible().catch(() => false)) {
      await designBtn.click();
      await p.waitForTimeout(2000);
    }
    await p.evaluate(() => window.scrollTo(0, 500));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/designer-dark.png" });
  });

  shot("learn-dark", async (p) => {
    await p.goto(`${BASE}/genome/learn`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(2500);
    await p.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/learn-crispr-dark.png" });
  });

  shot("protocols-dark", async (p) => {
    await p.goto(`${BASE}/protocols/agrobacterium-transformation`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(2000);
    await p.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/protocol-agrobacterium-dark.png" });
  });

  // ── Full-page screenshots of key pages ──
  shot("designer-fullpage", async (p) => {
    await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);
    const exampleBtn = p.locator("button", { hasText: /tomato|arabidopsis|rice|SlPDS|example/i }).first();
    if (await exampleBtn.isVisible().catch(() => false)) {
      await exampleBtn.click();
      await p.waitForTimeout(500);
    }
    const designBtn = p.locator("button", { hasText: /design|find|run|analyze/i }).first();
    if (await designBtn.isVisible().catch(() => false)) {
      await designBtn.click();
      await p.waitForTimeout(3000);
    }
    await p.screenshot({ path: "screenshots/designer-fullpage.png", fullPage: true });
  });

  shot("learn-fullpage", async (p) => {
    await p.goto(`${BASE}/genome/learn`, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(3000);
    await p.screenshot({ path: "screenshots/learn-fullpage.png", fullPage: true });
  });

  // Run all shots
  for (const s of shots) {
    console.log(`Capturing: ${s.name}...`);
    const p = await context.newPage();
    try {
      await s.fn(p);
      console.log(`  ✓ ${s.name}`);
    } catch (err) {
      console.error(`  ✗ ${s.name}: ${err.message}`);
    }
    await p.close();
  }

  await browser.close();
  console.log(`\nDone! Captured ${shots.length} screenshots.`);
}

main();
