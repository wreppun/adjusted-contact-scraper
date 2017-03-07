
const {db} = require('../db.js');
const getPks = require('./gamePks.js').onDate;
const {exitVelocities, leaguePerformance} = require('./statcastData.js');
const {flatten, nextDay} = require('../utils.js');
const timeout = 30000;

const singleDay = date => {
  return getPks(date)
    .map(exitVelocities)
    .then(flatten)
    .then(evs => db.batchInsert('exit_velocity', evs, 100).returning('id'))
    .then(ids => console.log(ids[ids.length - 1]));
};

const range = (current, end) => {
  singleDay(current)
    .then(() => {
      const nextDate = nextDay(current);

      if (nextDate.getTime() > end.getTime()) {
        return;
      }

      setTimeout(() => range(nextDate, end), timeout);
    });
};

const speedRange = (low, high) => {
  leaguePerformance(low)
    .then(results => db.batchInsert('league_performance', results).returning('id'))
    .then(ids => console.log(ids[ids.length - 1]))
    .then(() => {
      if (low + 1 > high) {
        return;
      }

      setTimeout(() => speedRange(low + 1, high), timeout / 10);
    });
};

module.exports = {
  exitVelocities: {
    singleDay,
    range
  },
  leaguePerformance: {
    singleSpeed: leaguePerformance,
    speedRange
  }
};
