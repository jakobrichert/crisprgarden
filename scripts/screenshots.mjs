import { chromium } from "playwright";

const BASE = "http://localhost:3001";
const pages = [
  { path: "/", name: "homepage", waitFor: 1000 },
  { path: "/designer", name: "designer", waitFor: 1500 },
  { path: "/genome", name: "genome-browser", waitFor: 1000 },
  { path: "/genome/learn", name: "learn-crispr", waitFor: 2500 },
  { path: "/protocols", name: "protocols", waitFor: 1000 },
  { path: "/protocols/dna-extraction", name: "protocol-detail", waitFor: 2000 },
  { path: "/protocols/agrobacterium-transformation", name: "protocol-agrobacterium", waitFor: 2000 },
  { path: "/wizard", name: "wizard", waitFor: 1000 },
  { path: "/experiments", name: "experiments", waitFor: 1000 },
  { path: "/feed", name: "community", waitFor: 1000 },
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  for (const page of pages) {
    console.log(`Capturing ${page.name} (${page.path})...`);
    const p = await context.newPage();
    try {
      await p.goto(`${BASE}${page.path}`, {
        waitUntil: "networkidle",
        timeout: 15000,
      });
      // Extra wait for 3D canvases to render
      await p.waitForTimeout(page.waitFor);
      await p.screenshot({
        path: `screenshots/${page.name}.png`,
        fullPage: false,
      });
      console.log(`  -> screenshots/${page.name}.png`);
    } catch (err) {
      console.error(`  -> FAILED: ${err.message}`);
    }
    await p.close();
  }

  await browser.close();
  console.log("Done!");
}

main();
