'use strict';

/**
 * Constructor for EventDispatcher object.
 *
 * @param {Object} options JSON configuration.
 * @param {Object} options.sns AWS.SNS object.
 * @param {Object} options.arns ARNs object.
 */
const EventDispatcher = class {
  constructor(options) {
    this.sns = options.sns;
    this.arns = options.arns;
  }

  /**
   * Dispatch currency changed event.
   *
   * @param {Object} currency Currency data.
   * @return {Promise}
   */
  dispatchCurrencyChangedEvent(currency) {
    let self = this;

    return Promise.resolve()
      .then(function() {
        let params = {
          Message: JSON.stringify(currency),
          TopicArn: self.arns.currencychanged
        };

        return self.sns.publish(params).promise();
      });
  }
};

module.exports = EventDispatcher;
