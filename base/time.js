'use strict';

const moment = require('moment');

const Time = class {
    /**
     * Constructor for Storage object.
     *
     */
    constructor() { }

    /**
     * Get Dates Between
     *
     * @param {Context} context context.
     * @param {Int} startDate timstamp.
     * @param {Int} endDate timstamp.
     * @return {Promise}
     */
    getDatesBetween(context, startDate, endDate) {
      let dateList = [];
      let curDate = moment(startDate);
      while (curDate.isBefore(endDate)) {
        dateList.push(curDate.format('YYYYMMDD'));
        curDate = curDate.add(1, 'd');
      }
      dateList.push(curDate.format('YYYYMMDD'));

      return dateList;
    };
};

module.exports = Time;
