const fs = require('fs');
const {db} = require('./db');
const {ev, la} = require('./constants/buckets');

const leaguePerformanceBuckets = (evBuckets, laBuckets) => {
  const evLaBuckets = evBuckets.map(evBucket => laBuckets.map(laBucket =>
    Object.assign({
      evMin: evBucket.min,
      evMax: evBucket.max,
      laMin: laBucket.min,
      laMax: laBucket.max
    })))
    .reduce((agg, buckets) => agg.concat(buckets), []);

  // console.log(evLaBuckets);

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
    .then(results => fs.writeFile('./processed/leaguePerformance.json', results));
};

module.exports = {
  leagueBuckets: () => leaguePerformanceBuckets(ev, la)
};
