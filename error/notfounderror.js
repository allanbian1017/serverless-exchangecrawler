'use strict';

/**
 * NotFoundError object.
 *
 */
class NotFoundError extends Error {
  /**
   * Constructor for NotFoundError object.
   *
   * @param {String} message message.
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = NotFoundError;
