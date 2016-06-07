require('isomorphic-fetch');
const cheerio = require('cheerio');

// const MEEUTP_URL = (community) => `http://www.meetup.com/${community}/members/`;
const MEEUTP_URL = (community) => `https://api.meetup.com/${community}`;

const fetchCommunity = (comunity) => {
  return fetch(MEEUTP_URL(comunity))
    .then(response => {
      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
      return response.json();
    })
    // .then(html => {
    //   const $ = cheerio.load(html);
    //   return $('#C_metabox .paddedList .lastUnit').first().text()
    // })
    .then(response => {
      console.log(response)
    })
    // .then(string => string.replace(/,/g, ''))
    // .then(strNumber => +strNumber)
    // .then(members => ({ comunity, members }));
};

const fetchCommunities = (communities) => {
  return Promise.all(communities.map(fetchCommunity));
};

module.exports = fetchCommunities;

fetchCommunities(['bogotajs', 'medellinjs'])
  .then(communitiesCount => {
    console.log(communitiesCount)
  })