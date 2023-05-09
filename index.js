require("dotenv").config();

const Gold = require("./src/gold");
const Keydrop = require("./src/keydrop");
const { wait, secondsToMs } = require("./src/time");

const keydrop = new Keydrop();
const gold = new Gold();

async function start() {
  await keydrop.start();

  while (true) {
    const goldenCodes = await gold.search();
    if (goldenCodes.length > 0) {
      for (const goldenCode of goldenCodes) {
        await keydrop.redeem(goldenCode);
      }
    }
    await wait(secondsToMs(30), 1000);
  }
}

start();
