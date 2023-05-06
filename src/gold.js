const debug = require("debug")("keymoney:gold");
const Discord = require("./discord");
const { timeDiff } = require("./time");

module.exports = class Gold {
  codes = [];
  discord = new Discord(process.env.DISCORD_TOKEN);

  async search() {
    debug("checking for golden codes");
    const messages = await this.discord.getLastMessages(
      process.env.DISCORD_CHANNEL
    );

    return messages.reduce((acc, message) => {
      const code = (message?.content ?? "").replace(/`/g, "");
      const time = new Date(message?.timestamp ?? "2023-01-01T00:00:00");

      if (
        code.length === 17 &&
        !this.codes.includes(code) &&
        timeDiff(time) < 60
      ) {
        debug(`received new code: ${code}`);
        this.codes.push(code);
        return [...acc, code];
      }

      return acc;
    }, []);
  }
};
