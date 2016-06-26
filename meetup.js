require('isomorphic-fetch');

const MEETUP_API_KEY = process.env.MEETUP_API_KEY;
const MEEUTP_URL = (community) => `https://api.meetup.com/${community}?key=${MEETUP_API_KEY}`;

if (!MEETUP_API_KEY) {
  throw new Error('No MEETUP_API_KEY was found in the environment.')
}

const fetchCommunity = (comunity) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('before!', comunity)
      fetch(MEEUTP_URL(comunity))
        .then( response => {
          console.log('X-RateLimit-Limit!', response.headers.get('X-RateLimit-Limit'))
          console.log('X-RateLimit-Remaining!', response.headers.get('X-RateLimit-Remaining'))
          console.log('fetched!', response.statusText)
          if (response.status >= 400) {
            throw new Error('Bad response from server:' + response.statusText);
          }
          response.json().then(communityJSON => {
            console.log('one!', comunity)
            communityJSON.queryId = comunity;
            resolve(communityJSON);
          });
        });
    }, 1000);
  });
};

const fetchCommunities = (communities) => {
  return Promise.all( communities.map( fetchCommunity ) );
};

module.exports.fetchCommunities = fetchCommunities;