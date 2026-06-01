// Захват превью проектов МТК через установленный Chrome (puppeteer-core).
// Использование: node tools/capture.mjs
import puppeteer from "puppeteer-core";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const OUT = new URL("../assets/previews/", import.meta.url).pathname;

// width/height — кадр захвата; wait — реальная пауза перед снимком (мс);
// crop — необязательная обрезка (для МТК-24 убираем правую тех-панель).
const SHOTS = [
  {
    name: "mtk24",
    url: "https://24.mtk.ostrov-vezeniya.ru",
    wait: 11000,
    width: 1600,
    height: 1000,
    clip: { x: 0, y: 0, width: 1120, height: 1000 }, // рабочий экран без ГЗК-панели
  },
  {
    name: "mtk29",
    url: "http://212.113.117.186:8091/expo/",
    wait: 6000,
    width: 1600,
    height: 1000,
  },
  {
    name: "mtk3842",
    url: "http://212.113.117.186:8094/",
    wait: 6000,
    width: 1600,
    height: 1000,
  },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1"],
});

for (const s of SHOTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.width, height: s.height });
  try {
    await page.goto(s.url, { waitUntil: "networkidle2", timeout: 30000 });
  } catch (e) {
    console.log(`${s.name}: goto warn — ${e.message}`);
  }
  await sleep(s.wait);
  const path = `${OUT}${s.name}.jpg`;
  await page.screenshot({
    path,
    type: "jpeg",
    quality: 82,
    clip: s.clip,
  });
  console.log(`${s.name} -> ${path}`);
  await page.close();
}

await browser.close();
console.log("done");
