const rp = require('request-promise');
const {pluck, rename} = require('../utils.js');
const dataIdentifier = 'var data = ';

const url = {
  exitVelocities: gamePk => `https://baseballsavant.mlb.com/gamefeed?game_pk=${gamePk}&type=exit_velocity`,
  leaguePerformance: ev => `https://baseballsavant.mlb.com/statcast_breakdown?exit_velocity=${ev}`
};

// sample PK: 448438
const exitVelocities = gamePk => {
  return rp(url.exitVelocities(gamePk))
    .then(page => {
      const start = page.indexOf(dataIdentifier) + dataIdentifier.length;
      const lineEnd = page.indexOf('\n', start);
      const data = page.substring(start, lineEnd - 1);

      return JSON.parse(data);
    })
    .then(data => data.exit_velocity)
    .map(trimToEvFields)
    .map(record => Object.assign({}, record, {game_pk: gamePk}))
    .catch(e => {
      console.log('error retrieving exitVelocities', gamePk);
      return [];
    });
};

const leaguePerformance = exitVelocity =>
  rp(url.leaguePerformance(exitVelocity))
    .then(JSON.parse)
    .map(trimToLeaguePerformance)
    .map(r => Object.assign(r, {hit_speed: exitVelocity}));

const trimToLeaguePerformance = raw => {
  const renamed = rename(raw, [
    {
      from: 'dbl',
      to: 'double'
    },
    {
      from: 'launch_angle',
      to: 'hit_angle'
    }
  ]);

  return pluck(renamed, [
    'hit_angle',
    'hit',
    'ab',
    'ba',
    'single',
    'double',
    'triple',
    'hr',
    'woba'
  ]);
};

function trimToEvFields (raw) {
  return pluck(raw, [
    'inning',
    'ab_number',
    'outs',
    'batter',
    'stand',
    'batter_name',
    'pitcher',
    'pitcher_name',
    'team_batting',
    'team_fielding',
    'result',
    'des',
    'events',
    'sv_id',
    'strikes',
    'balls',
    'pre_strikes',
    'pre_balls',
    'call',
    'call_name',
    'pitch_type',
    'description',
    'start_speed',
    'end_speed',
    'sz_top',
    'sz_bottom',
    'px',
    'pz',
    'x0',
    'z0',
    'hit_speed',
    'hit_distance',
    'hit_angle',
    'is_bip_out',
    'pitch_number',
    'hc_x',
    'hc_y',
    'xba'
  ]);
}

module.exports = {
  exitVelocities,
  leaguePerformance
};
