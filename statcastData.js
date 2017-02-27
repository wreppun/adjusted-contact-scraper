const rp = require('request-promise');
const dataIdentifier = 'var data = ';

function exitVelocities (gamePk) {
  return rp(buildUrl(gamePk))
    .then(page => {
      const start = page.indexOf(dataIdentifier) + dataIdentifier.length;
      const lineEnd = page.indexOf('\n', start);
      const data = page.substring(start, lineEnd - 1);

      return JSON.parse(data);
    })
    .then(data => data.exit_velocity);
}

function buildUrl (gamePk) {
  return `https://baseballsavant.mlb.com/gamefeed?game_pk=${gamePk}&type=exit_velocity`;
}

module.exports = {
  exitVelocities
};
