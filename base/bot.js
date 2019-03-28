'use strict';

const line = require('@line/bot-sdk');

const Bot = class {
  /**
   * Constructor for Bot object.
   *
   */
  constructor() {}

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
};

module.exports = Bot;
