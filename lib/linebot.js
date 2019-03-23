'use strict';

const LineBot = class {
  /**
   * Constructor for LineBot object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.lineclient line bot client object.
   * @param {Object} options.botuser BotUser object.
   */
  constructor(options) {
    this.lineClient = options.lineclient;
    this.botuser = options.botuser;
  }

  /**
   * Line Bot publish message.
   *
   * @param {String} msg Publish message.
   * @return {Promise}
   */
  async publish(msg) {
    let self = this;

    let users = await self.botuser.get('line');
    await self.lineClient.multicast(users, {type: 'text', text: msg});
    return {};
  }
};

module.exports = LineBot;
