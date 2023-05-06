const { default: axios } = require("axios");
const debug = require("debug")("keymoney:discord");

module.exports = class Discord {
  baseUrl = "https://discord.com/api/v10/";

  constructor(token) {
    this.token = token;
  }

  async getLastMessages(channel, limit = 3) {
    debug(`getting last messages`);

    const url = `channels/${channel}/messages?limit=${limit}`;

    const { data } = await axios.get(`${this.baseUrl}${url}`, {
      withCredentials: true,
      headers: {
        Authorization: this.token,
      },
    });

    return data;
  }
};
