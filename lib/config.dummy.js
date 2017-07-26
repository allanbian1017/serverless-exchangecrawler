'use strict';

let config = {
  'us-east-1': {
    line_config: {
      channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN',
      channelSecret: 'YOUR_CHANNEL_SECRET'
    }
  }
};



module.exports = {
  get: function(region) {
    return config[region];
  }
};
