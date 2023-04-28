const fs = require("fs");

const { default: puppeteer } = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

module.exports = class Keydrop {
  pages = [];
  selectors = {
    collect_button:
      "#promo-code-root > div > div.relative.grid.css-126rogm > div.relative.flex.flex-col.items-center.justify-center.col-start-1.row-start-1.px-10.py-5.text-center.transition-opacity.duration-500.md\\:px-20 > button",
    daily_open:
      "#dailyCase-root > div.container.hide-scrollbar.snap-x.snap-mandatory.overflow-x-auto > ul > li:nth-child(1) > button > div > div > canvas",
    x_button: "#promo-code-root > div > div.relative.grid.css-126rogm > button",
  };

  constructor() {
    puppeteer.use(StealthPlugin());
  }

  async start() {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: 'new',
    });

    const files = fs
      .readdirSync("./cookies")
      .filter((filename) => filename.endsWith(".json"));

    for (const file of files) {
      const context = await browser.createIncognitoBrowserContext();
      const page = await context.newPage();
      this.pages.push(page);

      await page.setCookie(...require(`../cookies/${file}`));
      console.log(`Account ${file} loaded`);

      await page.goto("https://key-drop.com/en/");

      setInterval(this.claimDaily, 12 * 60 * 60 * 1000, context);
      await this.claimDaily(context);
    }
  }

  wait(ms, maxErr = 100) {
    const time = Math.floor(ms + (Math.random() - 0.5) * 2 * maxErr);
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  async claimDaily(context) {
    console.log("[Daily] Claiming daily case");

    const dailyPage = await context.newPage();
    await dailyPage.goto("https://key-drop.com/en/Daily_free");
    console.log("[Daily] Successfully reached daily page");

    await dailyPage.waitForSelector(this.selectors.daily_open);
    await dailyPage.click(this.selectors.daily_open);

    await this.wait(3000);
    await dailyPage.close();
  }

  async redeemCodeOnPage(page, code) {
    console.log(`[Macro] Redirecting to https://key-drop.com/?code=${code}`);

    await Promise.allSettled([
      page.goto(`https://key-drop.com/?code=${code}`),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);

    await page.waitForSelector(this.selectors.collect_button);
    await this.wait(3000);
    await page.click(this.selectors.collect_button);
  }

  async redeem(code) {
    console.log(`[Redeemer] Redeeming code ${code}`);
    await Promise.allSettled(
      this.pages.map((page) => this.redeemCodeOnPage(page, code))
    );
  }
};
