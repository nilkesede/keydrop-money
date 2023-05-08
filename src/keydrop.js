const fs = require("fs");

const debug = require("debug")("keymoney:keydrop");
const { default: puppeteer } = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const { wait, secondsToMs, hoursToMs, minutesToMs } = require("./time");

module.exports = class Keydrop {
  pages = [];
  indexURL = "https://key-drop.com/en/panel/profil/free-gold";
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
      debug(`account ${file} loaded`);

      setInterval(this.verifyLogin.bind(this), hoursToMs(1), page);
      await this.verifyLogin(page);

      setInterval(this.claimDaily.bind(this), hoursToMs(12), context);
      await this.claimDaily(context);

      // setInterval(this.enterGiveaways.bind(this), minutesToMs(5), context);
      // await this.enterGiveaways(context);
    }
  }

  async verifyLogin(page) {
    debug("verifying login");

    await Promise.all([
      page.goto(this.indexURL),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);

    try {
      const loginBtn = await page.waitForSelector("[data-login-link]", {
        timeout: secondsToMs(5),
      });

      if (loginBtn) {
        throw new Error("user logged out");
      }
    } catch (error) {
      if (error.name === "TimeoutError") {
        debug("user logged in");
        return;
      }
      throw error;
    }
  }

  async claimDaily(context) {
    debug("claiming daily case");

    const page = await context.newPage();
    await page.goto("https://key-drop.com/en/daily-case");
    debug("successfully reached daily page");

    await page.waitForSelector(this.selectors.daily_open);
    await page.click(this.selectors.daily_open);

    await wait(secondsToMs(3));
    await page.close();
  }

  async redeemCodeOnPage(page, code) {
    debug(`redirecting to https://key-drop.com/?code=${code}`);

    await Promise.allSettled([
      page.goto(`https://key-drop.com/?code=${code}`),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);

    await page.waitForSelector(this.selectors.collect_button);
    await wait(secondsToMs(3));
    await page.click(this.selectors.collect_button);
    await wait(secondsToMs(1));
    await page.goto(this.indexURL);
  }

  async redeem(code) {
    debug(`redeeming code ${code}`);
    await Promise.allSettled(
      this.pages.map((page) => this.redeemCodeOnPage(page, code))
    );
  }

  async enterGiveaway(index, page) {
    try {
      debug(`entering giveaway ${index}`);

      await page.waitForSelector(
        `#giveaways-root > div > div > div:nth-child(3) .grid .grid-stack:nth-child(${index}) a.button-light-green`,
        { timeout: secondsToMs(3) }
      );
      await wait(secondsToMs(1));
      await page.click(
        `#giveaways-root > div > div > div:nth-child(3) .grid .grid-stack:nth-child(${index}) a.button-light-green`
      );

      await page.waitForSelector(
        "#giveaways-root > div > div > div > div:nth-child(4)>div:nth-child(1)>div:nth-child(2) button",
        { timeout: secondsToMs(3) }
      );
      await wait(secondsToMs(1));
      await page.click(
        "#giveaways-root > div > div > div > div:nth-child(4)>div:nth-child(1)>div:nth-child(2) button"
      );
      await wait(secondsToMs(3));
    } catch (error) {
      debug("cannot enter giveaway");
    }
  }

  async enterGiveaways(context) {
    debug("entering giveaways");

    const page = await context.newPage();

    for (let index = 5; index > 0; index--) {
      await page.goto("https://key-drop.com/en/giveaways/list");
      await this.enterGiveaway(index, page);
    }

    page.close();
  }
};
