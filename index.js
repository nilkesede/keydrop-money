require("dotenv").config();

const Gold = require("./src/gold");
const Keydrop = require("./src/keydrop");

const keydrop = new Keydrop();
const gold = new Gold();

async function start() {
  await keydrop.start();

  while (true) {
    await wait(30000);

    const goldenCodes = await gold.search();
    if (goldenCodes.length > 0) {
      for (const goldenCode of goldenCodes) {
        await keydrop.redeem(goldenCode);
      }
    }
  }
}

function wait(ms, maxErr = 100) {
  const time = Math.floor(ms + (Math.random() - 0.5) * 2 * maxErr);
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

start();
