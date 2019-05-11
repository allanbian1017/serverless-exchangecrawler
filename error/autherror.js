'use strict';

/**
 * AuthError object.
 *
 */
class AuthError extends Error {
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

module.exports = AuthError;
