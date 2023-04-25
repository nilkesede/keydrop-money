const { default: axios } = require("axios");

module.exports = class Discord {
  baseUrl = "https://discord.com/api/v10/";

  constructor(token) {
    this.token = token;
  }

  async getLastMessage(channel) {
    const url = `channels/${channel}/messages?limit=1`;

    const { data } = await axios.get(`${this.baseUrl}${url}`, {
      withCredentials: true,
      headers: {
        Authorization: this.token,
      },
    });

    return data[0];
  }
};
