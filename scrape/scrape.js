
const {db} = require('../db.js');
const getPks = require('./gamePks.js').onDate;
const {exitVelocities, leaguePerformance} = require('./statcastData.js');
const {flatten, nextDay, peek} = require('../utils.js');
const evTimeout = 30000;
const pkTimeout = 1000;

const evSingleDay = date => {
  return getPks(date)
    .map(exitVelocities)
    .then(flatten)
    .then(evs => db.batchInsert('exit_velocity', evs, 100).returning('id'))
    .then(ids => console.log(ids[ids.length - 1]));
};

const forDateRange = (forDateFn, timeout) => {
  return function range (current, end) {
    forDateFn(current)
      .then(() => {
        const nextDate = nextDay(current);

        if (nextDate.getTime() > end.getTime()) {
          return;
        }

        setTimeout(() => range(nextDate, end), timeout);
      });
  };
};

const speedRange = (low, high) => {
  leaguePerformance(low)
    .then(results => db.batchInsert('league_performance', results).returning('id'))
    .then(ids => console.log(ids[ids.length - 1]))
    .then(() => {
      if (low + 1 > high) {
        return;
      }

      setTimeout(() => speedRange(low + 1, high), evTimeout / 10);
    });
};

const gamePksRange = (start, end) => {
  console.log(start, end);

  const getPksRange = forDateRange(current => {
    return getPks(current)
      .then(peek)
      .map(gamePk => db('game_pk').insert({
        id: gamePk,
        game_date: current.toISOString()
      }));
  }, pkTimeout);

  getPksRange(start, end);
};

module.exports = {
  exitVelocities: {
    singleDay: evSingleDay,
    range: forDateRange(evSingleDay, evTimeout)
  },
  leaguePerformance: {
    singleSpeed: leaguePerformance,
    speedRange
  },
  gamePks: {
    range: gamePksRange
  },
  test: () => console.log('hi?')
};
