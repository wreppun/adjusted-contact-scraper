const rp = require('request-promise');
const Dom = require('xmldom').DOMParser;
const xpath = require('xpath');

function onDate (date) {
  const indexUrl = createIndexUrl(date);

  console.log(date.toISOString());

  return rp(indexUrl)
    .then(indexPage => {
      const doc = new Dom().parseFromString(indexPage);

      return xpath
        .select('//a[starts-with(@href, "gid_")]/@href', doc)
        .map(game => game.value)
        .map(gameId => indexUrl + gameId + 'boxscore.json');
    })
    .map(boxscoreUrl => rp(boxscoreUrl).catch(e => false))
    .filter(json => json)
    .map(JSON.parse)
    .map(extractGamePk)
    .catch(e => {
      console.log('error retrieving pk', indexUrl);
      throw e;
    });
}

function extractGamePk (boxscore) {
  return boxscore.data.boxscore.game_pk;
}

function createIndexUrl (date) {
  const baseUrl = 'http://gd2.mlb.com/components/game/mlb/';
  const year = date.getUTCFullYear();

  // month is zero indexed
  const month = maybePad(date.getMonth() + 1);

  // date is not
  const day = maybePad(date.getDate());

  return `${baseUrl}year_${year}/month_${month}/day_${day}/`;
}

function maybePad (num) {
  return num < 10 ? '0' + num : '' + num;
}

module.exports = {
  onDate
};
