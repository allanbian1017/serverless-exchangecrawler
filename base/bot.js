'use strict';

const line = require('@line/bot-sdk');
const HttpClient = require('./httpclient');

const Bot = class {
  /**
   * Constructor for Bot object.
   *
   */
  constructor() {
    this.client = new HttpClient();
  }

  /**
   * Bot publish message.
   *
   * @param {Context} context context.
   * @param {String} plat platform to publish message.
   * @param {Array} users users to publish.
   * @param {String} msg text to publish.
   * @return {Promise}
   */
  async publish(context, plat, users, msg) {
    switch (plat) {
      case 'line':
        let lineClient = new line.Client({
          channelAccessToken: process.env.LINE_ACCESSTOKEN,
          channelSecret: process.env.LINE_SECRET,
        });

        await lineClient.multicast(users, {type: 'text', text: msg});
        break;
    }

    return {};
  }

  /**
   * Get bot user id.
   *
   * @param {Context} context context.
   * @param {String} plat platform belong to user.
   * @param {String} token user token.
   * @return {Promise}
   */
  async getUserID(context, plat, token) {
    switch (plat) {
      case 'line':
        let apiUrl = 'https://api.line.me/v2/profile';
        let resp = await this.client.get(context, apiUrl, {
          Authorization: 'Bearer ' + token,
        });

        if (resp.body) {
          let body = JSON.parse(resp.body);
          return body.userId;
        }

        return '';
    }

    return '';
  }
};

module.exports = Bot;
