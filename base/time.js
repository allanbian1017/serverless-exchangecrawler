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
     * @param {Int} endtDate timstamp.
     * @return {Promise}
     */
    async getDatesBetween(context, startDate, endtDate) {
        moment().format('YYYYMMDD');
        let dateList = [];
        while (moment(startDate).isBefore(endtDate)) {
            let i = 1;
            dateList.push(startDate);
            startDate = moment(startDate).add(i, 'd').format('YYYYMMDD');
            i++;
        }
        dateList.push(startDate);
        return dateList;
    };
};

module.exports = Time;
