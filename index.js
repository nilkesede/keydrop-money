require("dotenv").config();

const Discord = require("./src/discord");
const Keydrop = require("./src/keydrop");

const goldenCodes = [];

const discord = new Discord(process.env.DISCORD_TOKEN);
const keydrop = new Keydrop();

async function run() {
  await keydrop.start();

  while (true) {
    try {
      await wait(30000);

      console.info("[Discord] Verifying golden codes...");
      const goldenCodes = await searchForGold();

      if (goldenCodes.length > 0) {
        for (const goldenCode of goldenCodes) {
          console.log(`[Discord] Received new code: ${goldenCode}`);
          await keydrop.redeem(goldenCode);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

async function searchForGold() {
  const messages = await discord.getLastMessages(process.env.DISCORD_CHANNEL);

  return messages.reduce((acc, message) => {
    const goldenCode = (message?.content ?? "").replace(/`/g, "");
    const goldenTime = new Date(message?.timestamp ?? "2023-01-01T00:00:00");
    const timeDiff = Math.floor(
      Math.abs(new Date().valueOf() - goldenTime.valueOf()) / 1000 / 60
    );

    if (
      goldenCode.length === 17 &&
      !goldenCodes.includes(goldenCode) &&
      timeDiff < 60 * 3
    ) {
      goldenCodes.push(goldenCode);
      return [...acc, goldenCode];
    }

    return acc;
  }, []);
}

function wait(ms, maxErr = 100) {
  const time = Math.floor(ms + (Math.random() - 0.5) * 2 * maxErr);
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

run();
