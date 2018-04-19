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
  publish(msg) {
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

module.exports = LineBot;
