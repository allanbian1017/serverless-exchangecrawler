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

    return Promise.resolve()
      .then(function() {
        let params = {
          Bucket: self.bucket, 
          Key: 'Users/' + plat + '.json'
        };

        return self.storage.getObject(params).promise();
      })
      .then(function(data) {
        let payload = JSON.parse(new Buffer(data.Body).toString('ascii'));
        return Promise.resolve(payload.Users);
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

    return Promise.resolve()
      .then(function() {
        let params = {
          Bucket: self.bucket,
          Key: 'Users/' + plat + '.json',
          Body: JSON.stringify({
            Users: users
          })
        };

        return self.storage.putObject(params).promise();
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

    return Promise.resolve()
      .then(function() {
        return self.get(plat);
      })
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

    return Promise.resolve()
      .then(function() {
        return self.get(plat);
      })
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
