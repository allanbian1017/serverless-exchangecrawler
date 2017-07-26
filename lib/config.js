'use strict';

let config = {
  'us-east-1': {
    line_config: {
      channelAccessToken: 'zPDdVYiMGHmVsMhjFbQ+s5MmKKXzEYD6KW6vvjk1rVYy+tuPK9VuW8OtsVlgNhHnPwV18r5ejjusZOgiMTQlzAU7Hq4tse9VFDSH0LqQOofKMV7uR3QOW4idxT4FP/kRzSTE4ZLFrhDo3dK4gxj4ogdB04t89/1O/w1cDnyilFU=',
      channelSecret: 'c2d0fb79e5736fc3416e0c822b30c7b5'
    }
  }
};



module.exports = {
  get: function(region) {
    return config[region];
  }
};
