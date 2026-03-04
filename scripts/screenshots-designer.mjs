import { chromium } from "playwright";

const BASE = "http://localhost:3001";

const EXAMPLE_SEQ = "ATGGCTTCTATGATTTCTACTCAAGCTTTGCCTAAACCAGCTCCTGTTCCTGTGAAATCAAAGCCTAAGGTTCAATCTCCAGGTCCAAGGTTTGGGATCCATGATGCTGATCCTAATTGGGATCTAGCTGCTAAAGATGTTGATCTTGGTTTTGATCCAAATAATCCAGATTTGGATCAAGTTAGGATCGATGATAAGAAGATTAAGGCTGTAGTTGAAGAAGGTATAAAGATTGGTGATATAGCAATTGGTGGATCTTTGCAGAATCATCCATTTGGTGCTACTGATAGAGATGATCCTCACATCATGGCTCTCTTGGCAGCATATCCTGACCTTCAGAGACTTGTTGACCCTGATGGAAATCAAGCATTTGATACAATCCTTAAAGCATTTGGAAACACTCCTTTCTTAACCGCAACAGAAGATGTGATCAAAGCAGGAACCGCAACTGTGACATCACCAGAAGTTGTTATTCCAAAGGATGTTCCCATTCTGGACTTGCAAAGAGATTTCATCAGGAAGAATCCAGATATAATTGAAGGGTGTGATGCTTTTACTGATGAAGAGTTCTTGAAGATGCTTCTAGATGCTAATTTCTCCTTGTTTGATCCAAAAGGTCTTGATACCTTCCTTGCACAGAGAAAATCTGAGCTTATTGGTCATAATTTGGATGAAGCCAAAGCTCTGAAAGAAATGAAT";

async function fillSequenceAndDesign(p) {
  await p.goto(`${BASE}/designer`, { waitUntil: "networkidle", timeout: 15000 });
  await p.waitForTimeout(1000);

  // Click "Paste Sequence" tab to reveal the textarea
  await p.locator("button", { hasText: "Paste Sequence" }).click();
  await p.waitForTimeout(500);

  // Now fill the textarea
  await p.locator("textarea").first().fill(EXAMPLE_SEQ);
  await p.waitForTimeout(500);

  // Click Find Guides
  await p.locator("button", { hasText: "Find Guides" }).click({ timeout: 5000 });
  await p.waitForTimeout(4000);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const shots = [];
  function shot(name, fn) { shots.push({ name, fn }); }

  shot("designer-results", async (p) => {
    await fillSequenceAndDesign(p);
    await p.evaluate(() => window.scrollTo(0, 400));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/designer-results.png" });
  });

  shot("designer-guide-table", async (p) => {
    await fillSequenceAndDesign(p);
    await p.evaluate(() => window.scrollTo(0, 800));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/designer-guide-table.png" });
  });

  shot("designer-cut-site", async (p) => {
    await fillSequenceAndDesign(p);
    await p.evaluate(() => window.scrollTo(0, 1300));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/designer-cut-site.png" });
  });

  shot("designer-3d-viewer", async (p) => {
    await fillSequenceAndDesign(p);
    await p.evaluate(() => window.scrollTo(0, 1800));
    await p.waitForTimeout(2000);
    await p.screenshot({ path: "screenshots/designer-3d-viewer.png" });
  });

  shot("designer-sequence-viewer", async (p) => {
    await fillSequenceAndDesign(p);
    await p.evaluate(() => window.scrollTo(0, 2300));
    await p.waitForTimeout(1000);
    await p.screenshot({ path: "screenshots/designer-sequence-viewer.png" });
  });

  shot("designer-offtargets", async (p) => {
    await fillSequenceAndDesign(p);
    await p.evaluate(() => window.scrollTo(0, 2800));
    await p.waitForTimeout(2000);
    await p.screenshot({ path: "screenshots/designer-offtargets.png" });
  });

  shot("designer-primers", async (p) => {
    await fillSequenceAndDesign(p);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(1000);
    await p.screenshot({ path: "screenshots/designer-primers.png" });
  });

  shot("designer-fullpage", async (p) => {
    await fillSequenceAndDesign(p);
    await p.waitForTimeout(2000);
    await p.screenshot({ path: "screenshots/designer-fullpage.png", fullPage: true });
  });

  shot("designer-dark", async (p) => {
    await fillSequenceAndDesign(p);
    await p.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await p.evaluate(() => window.scrollTo(0, 400));
    await p.waitForTimeout(500);
    await p.screenshot({ path: "screenshots/designer-dark.png" });
  });

  shot("designer-dark-3d", async (p) => {
    await fillSequenceAndDesign(p);
    await p.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await p.evaluate(() => window.scrollTo(0, 1800));
    await p.waitForTimeout(2000);
    await p.screenshot({ path: "screenshots/designer-dark-3d.png" });
  });

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
  console.log(`Done! ${shots.length} designer screenshots.`);
}

main();
