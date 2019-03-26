'use strict';

const winston = require('winston');
const Logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

module.exports = Logger;
