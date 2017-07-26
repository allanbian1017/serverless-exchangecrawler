'use strict';

/**
 * Constructor for BotUser object.
 *
 * @param {Object} options JSON configuration.
 * @param {Object} options.storage AWS.S3 object.
 */
const BotUser = class {
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
  get(plat) {
    let self = this;

    return new Promise(function(resolve, reject) {
      let params = {
        Bucket: self.bucket, 
        Key: 'Users/' + plat + '.json'
      };

      self.storage.getObject(params, function(err, data) {
        if (err) return reject(err);

        let payload = JSON.parse(new Buffer(data.Body).toString('ascii'));
        resolve(payload.Users);
      });
    });
  }

  /**
   * Put bot users.
   *
   * @param {String} plat Bot platform.
   * @param {Object} users Bot users.
   * @return {Promise}
   */
  put(plat, users) {
    let self = this;

    return new Promise(function(resolve, reject) {
      let params = {
        Bucket: self.bucket,
        Key: 'Users/' + plat + '.json',
        Body: JSON.stringify({
          Users: users
        })
      };

      self.storage.putObject(params, function(err, data) {
        if (err) return reject(err);

        resolve();
      });
    });
  }

  /**
   * Add bot user.
   *
   * @param {String} plat Bot platform.
   * @param {Object} user Bot user.
   * @return {Promise}
   */
  add(plat, user) {
    let self = this;

    return self.get(plat)
      .then(function(data) {
        data.push(user);
        return self.put(plat, data);
      });
  }

  /**
   * Delete bot user.
   *
   * @param {String} plat Bot platform.
   * @param {Object} user Bot user.
   * @return {Promise}
   */
  del(plat, user) {
    let self = this;

    return self.get(plat)
      .then(function(data) {
        let idx = data.indexOf(user);
        if (idx !== -1) {
          data.splice(idx, 1);
        }

        return self.put(plat, data);
      });
  }
};

module.exports = BotUser;
