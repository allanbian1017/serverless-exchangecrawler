'use strict';

const BotUser = class {
  /**
   * Constructor for BotUser object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.storage AWS.S3 object.
   */
  constructor(options) {
    this.storage = options.storage;
    this.bucket = 'currencybucket';
  }

  /**
   * Get bot users.
   *
   * @param {String} plat Bot platform.
   * @return {Promise}
   */
  async get(plat) {
    let self = this;

    let params = {
      Bucket: self.bucket,
      Key: 'Users/' + plat + '.json',
    };

    let record = await self.storage.getObject(params).promise();
    let payload = JSON.parse(new Buffer(record.Body).toString('ascii'));
    return payload.Users;
  }

  /**
   * Put bot users.
   *
   * @param {String} plat Bot platform.
   * @param {Object} users Bot users.
   * @return {Promise}
   */
  async put(plat, users) {
    let self = this;

    let params = {
      Bucket: self.bucket,
      Key: 'Users/' + plat + '.json',
      Body: JSON.stringify({
        Users: users,
      }),
    };

    await self.storage.putObject(params).promise();
    return {};
  }

  /**
   * Add bot user.
   *
   * @param {String} plat Bot platform.
   * @param {Object} user Bot user.
   * @return {Promise}
   */
  async add(plat, user) {
    let self = this;

    let record = await self.get(plat);
    record.push(user);
    await self.put(plat, record);
    return {};
  }

  /**
   * Delete bot user.
   *
   * @param {String} plat Bot platform.
   * @param {Object} user Bot user.
   * @return {Promise}
   */
  async del(plat, user) {
    let self = this;

    let records = await self.get(plat);
    let idx = records.indexOf(user);
    if (idx !== -1) {
      records.splice(idx, 1);
    }

    await self.put(plat, records);
    return {};
  }
};

module.exports = BotUser;
