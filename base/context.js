'use strict';

const Context = class {
  /**
   * Constructor for Context object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.event Lambda event object.
   * @param {Object} options.cb Lambda callback object.
   * @param {Object} options.logger Logger object.
   */
  constructor(options) {
    this.event = options.event;
    this.cb = options.cb;
    this.logger = options.logger;
  }

  /**
   * Callback
   *
   * @param {Error} err error to return.
   * @param {Object} obj object to return.
   */
  cb(err, obj) {
    this.logger.end();
    if (err) {
      this.cb(err);
      return;
    }

    this.cb(null, obj);
  }
};

module.exports = Context;
