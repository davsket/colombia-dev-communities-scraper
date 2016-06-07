require('isomorphic-fetch');

const MEETUP_API_KEY = process.env.MEETUP_API_KEY;
const MEEUTP_URL = (community) => `https://api.meetup.com/${community}?key=${MEETUP_API_KEY}`;

if (!MEETUP_API_KEY) {
  throw new Error('No MEETUP_API_KEY was found in the environment.')
}

const fetchCommunity = (comunity) => {
  return fetch(MEEUTP_URL(comunity))
    .then( response => {
      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
      return response.json();
    })
};

const fetchCommunities = (communities) => {
  return Promise.all( communities.map( fetchCommunity ) );
};

module.exports.fetchCommunities = fetchCommunities;