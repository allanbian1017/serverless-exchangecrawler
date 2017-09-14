'use strict';

/**
 * Constructor for CurrencyBot object.
 *
 * @param {Object} options JSON configuration.
 * @param {Object} options.lineclient line bot client object.
 * @param {Object} options.botuser BotUser object.
 */
const CurrencyBot = class {
  constructor(options) {
    this.lineClient = options.lineclient;
    this.botuser = options.botuser;
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

    return Promise.resolve()
      .then(function() {
        return Promise.all(events.map(function(x) {
            if (x.type === 'message' && x.message.type === 'text') {
              return self.lineClient.replyMessage(x.replyToken, {type: 'text', text: reply.default});
            } else if (x.type === 'follow') {
              return self.botuser.add('line', x.source.userId);
            } else if (x.type === 'unfollow') {
              return self.botuser.del('line', x.source.userId);
            } else {
              return Promise.resolve();
            }
         })
        );
      });
  }

  /**
   * Line Bot publish message.
   *
   * @param {String} msg Publish message.
   * @return {Promise}
   */
  lineBotPublish(msg) {
    let self = this;

    return Promise.resolve()
      .then(function() {
        return self.botuser.get('line');
      })
      .then(function(data) {
        return self.lineClient.multicast(data, {type: 'text', text: msg});
      });
  }
};

module.exports = CurrencyBot;
