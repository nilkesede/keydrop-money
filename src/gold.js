const Discord = require("./discord");
const debug = require('debug')('keymoney:gold');

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
      const timeDiff = Math.floor(
        Math.abs(new Date().valueOf() - time.valueOf()) / 1000 / 60
      );

      if (
        code.length === 17 &&
        !this.codes.includes(code) &&
        timeDiff < 60 * 3
      ) {
        debug(`received new code: ${code}`);
        this.codes.push(code);
        return [...acc, code];
      }

      return acc;
    }, []);
  }
};
