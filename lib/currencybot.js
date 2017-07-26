'use strict';

/**
 * Constructor for CurrencyBot object.
 *
 * @param {Object} options JSON configuration.
 * @param {Object} options.lineclient line bot client object.
 */
const CurrencyBot = class {
  constructor(options) {
    this.lineClient = options.lineclient;
  }

  /**
   * Line Bot handler.
   *
   * @param {Object} headers Http headers.
   * @param {Object} body Http body.
   * @param {Object} reply Reply options.
   * @return {Promise}
   */
  lineBotHandler(headers, body, reply) {
    let self = this;
    let events = body.events;

    return Promise.all(events.map(function(x) {
        if (x.type === 'message' && x.message.type === 'text') {
          return self.lineClient.replyMessage(x.replyToken, {type: 'text', text: reply.default});
        } else {
          return Promise.resolve();
        }
     })
    );
  }

  /**
   * Line Bot publish message.
   *
   * @param {Array} ids User id.
   * @param {String} msg Publish message.
   * @return {Promise}
   */
  lineBotPublish(id, msg) {
    let self = this;

    return self.lineClient.multicast(id, {type: 'text', text: msg});
  }
};

module.exports = CurrencyBot;
