const fs = require('fs');
const {db} = require('../db');
const {ev, la} = require('./constants/buckets');
const {rename} = require('../utils');

const allLeague = () => db('league_performance')
    .select('hit_angle', 'hit_speed', 'ab', 'woba')
    .then(records => { console.log(records.length); return records; })
    .then(records => records.map(record => rename(record, [
      {
        from: 'hit_angle',
        to: 'angle'
      },
      {
        from: 'hit_speed',
        to: 'velocity'
      }
    ])))
    .then(records => JSON.stringify(records, null, 2))
    .then(records => fs.writeFile('./static/leaguePerformanceAll.json', records));

const leaguePerformanceBuckets = (evBuckets, laBuckets) => {
  const evLaBuckets = evBuckets.map(evBucket => laBuckets.map(laBucket =>
    Object.assign({
      evMin: evBucket.min,
      evMax: evBucket.max,
      laMin: laBucket.min,
      laMax: laBucket.max
    })))
    .reduce((agg, buckets) => agg.concat(buckets), []);

  Promise.all(
    evLaBuckets.map(bucket => db('league_performance')
        .select('hit_angle', 'hit_speed', 'ab', 'woba')
        .whereBetween('hit_speed', [bucket.evMin, bucket.evMax])
        .whereBetween('hit_angle', [bucket.laMin, bucket.laMax])
        .then(results =>
          results.reduce((agg, row, i) => {
            agg.abs += row.ab;
            agg.wobas += row.woba * row.ab;
            return agg;
          }, { abs: 0, wobas: 0 }))
        .then(aggregate => Object.assign({}, aggregate, bucket))
      )
    )
    .then(results => results
        .filter(r => r.abs > 0)
        .map(r => Object.assign({}, r, {wobaAvg: r.wobas / r.abs})))
    .then(results => JSON.stringify(results, null, 2))
    .then(results => fs.writeFile('./static/leaguePerformance.json', results));
};

const playerInfo = () => db('exit_velocity')
    .distinct('batter_name', 'batter')
    .select()
    .then(results => results.sort((a, b) => a.batter_name.localeCompare(b.batter_name)))
    .then(results => results.map(r => rename(r, [
      {
        from: 'batter_name',
        to: 'name'
      },
      {
        from: 'batter',
        to: 'id'
      }
    ])))
    .then(results => JSON.stringify(results, null, 2))
    .then(results => fs.writeFile('./static/players.json', results));

module.exports = {
  allLeague,
  leagueBuckets: () => leaguePerformanceBuckets(ev, la),
  playerInfo
};
