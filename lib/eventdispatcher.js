'use strict';

const EventDispatcher = class {
  /**
   * Constructor for EventDispatcher object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.sns AWS.SNS object.
   * @param {Object} options.arns ARNs object.
   */
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
  async dispatchCurrencyChangedEvent(currency) {
    let self = this;

    let params = {
      Message: JSON.stringify(currency),
      TopicArn: self.arns.currencychanged,
    };

    await self.sns.publish(params).promise();
    return {};
  }
};

module.exports = EventDispatcher;
