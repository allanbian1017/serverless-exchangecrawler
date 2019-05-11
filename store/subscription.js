'use strict';

const Metrics = require('../base/metrics');
const NotFoundError = require('../error/notfounderror');
const metrics = new Metrics('subscription');

const Subscription = class {
  /**
   * Constructor for Subscription object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.storage Storage object.
   */
  constructor(options) {
    this.storage = options.storage;
  }

  /**
   * List bot users by platform.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @return {Promise}
   */
  async listUsers(context, plat) {
    metrics.count('exec', 1, {
      func: 'listUsers',
    });

    try {
      let path = 'Users/' + plat + '.json';
      let record = await this.storage.get(context, 'currencybucket', path);
      return record.Users;
    } catch (err) {
      context.logger.log('error', 'listUsers error', {err: err});
      if (err instanceof NotFoundError) {
        return {};
      }

      return err;
    }
  }

  /**
   * Put bot users by platform.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {Array} userIDs Bot user ids.
   * @return {Promise}
   */
  async putUsers(context, plat, userIDs) {
    metrics.count('exec', 1, {
      func: 'putUsers',
    });

    let obj = {
      Users: userIDs,
    };

    let path = 'Users/' + plat + '.json';
    await this.storage.put(context, 'currencybucket', path, obj);
    return {};
  }

  /**
   * Add bot user.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {String} userID Bot user id.
   * @return {Promise}
   */
  async isUserInSubsctipion(context, plat, userID) {
    metrics.count('exec', 1, {
      func: 'isUserInSubsctipion',
    });

    let userIDs = await this.listUsers(context, plat);
    let idx = userIDs.indexOf(userID);
    if (idx === -1) {
      return false;
    }
    return true;
  }

  /**
   * Add bot user.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {String} userID Bot user id to add.
   * @return {Promise}
   */
  async addUser(context, plat, userID) {
    metrics.count('exec', 1, {
      func: 'addUser',
    });

    // FIXME this is not atomic operation, it may cause racing issue
    let userIDs = await this.listUsers(context, plat);
    userIDs.push(userID);
    await this.putUsers(context, plat, userIDs);
    return {};
  }

  /**
   * Remove bot user.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {String} userID Bot user id to remove.
   * @return {Promise}
   */
  async removeUser(context, plat, userID) {
    metrics.count('exec', 1, {
      func: 'removeUser',
    });

    // FIXME this is not atomic operation, it may cause racing issue
    let userIDs = await this.listUsers(context, plat);
    let idx = userIDs.indexOf(userID);
    if (idx !== -1) {
      userIDs.splice(idx, 1);
      await this.putUsers(context, plat, userIDs);
    }

    return {};
  }
};

module.exports = Subscription;
