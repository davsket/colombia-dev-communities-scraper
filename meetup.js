require('isomorphic-fetch');
const _       = require('lodash');
const cheerio = require('cheerio');

const MEETUP_API_KEY = process.env.MEETUP_API_KEY;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const MEEUTP_URL = (community) => `https://api.meetup.com/${community}?key=${MEETUP_API_KEY}`;
const MEEUTP_DIRTY_URL = (community) => `http://www.meetup.com/${community}/members/`;

const MEETUP_CACHE = {};
var fetched = {};

if (!MEETUP_API_KEY) {
  throw new Error('No MEETUP_API_KEY was found in the environment.')
}

const dirtyFetchCommunity = (community) => {
  return fetch(MEEUTP_DIRTY_URL(community))
    .then(response => {
      if (response.status >= 400) {
        throw new Error('Bad response from server :(... ' + response.statusText);
      }
      return response.text();
    })
    .then(html => {
      const $ = cheerio.load(html);
      const $organizer = $('#meta-leaders').children().first();
      var organizerPhotoId = $('#meta-org-photo img').attr('src').match(/(\d+)\.\w+$/);
      var groupPhotoId = $('#C_metabox .photo').attr('src').match(/(\d+)\.\w+$/);
      organizerPhotoId = organizerPhotoId && organizerPhotoId[1];
      groupPhotoId = groupPhotoId && groupPhotoId[1];

      return {
        name: $('h1 a').text().replace(/\n/g,''),
        members: parseInt($('#C_metabox .paddedList .lastUnit').first().text().replace(/,/g, '')),
        description: $('#bubble-groupDesc').html().replace(/\n/g,'').replace(/\s+/g,' '),
        created: +new Date($('#C_metabox .small.margin-bottom').first().text().replace(/founded/i,'')),
        city: $('.locality').text(),
        organizer: {
          name: $organizer.text(),
          id: $organizer.data('id'),
          photo: {
            id: organizerPhotoId,
            highres_link: `http://photos3.meetupstatic.com/photos/member/7/3/1/6/highres_${organizerPhotoId}.jpeg`,
            photo_link: `http://photos3.meetupstatic.com/photos/member/7/3/1/6/600_${organizerPhotoId}.jpeg`,
            thumb_link: `http://photos3.meetupstatic.com/photos/member/7/3/1/6/thumb_${organizerPhotoId}.jpeg`
          },
          group_photo: {
            id: groupPhotoId,
            highres_link: `http://photos3.meetupstatic.com/photos/event/9/e/6/7/highres_${groupPhotoId}.jpeg`,
            photo_link: `http://photos3.meetupstatic.com/photos/event/9/e/6/7/600_${groupPhotoId}.jpeg`,
            thumb_link: `http://photos3.meetupstatic.com/photos/event/9/e/6/7/thumb_${groupPhotoId}.jpeg`
          }
        },
        scrapped: true
      };
    })
    .catch(e => {
      console.error(`Could not load ${community}:`, e)
      return null
    })
};

const fetchCommunity = (community) => {
  const now = Date.now();
  var cache = MEETUP_CACHE[community];
  fetched[community] = false;

  if (!cache || cache.date + CACHE_DURATION < now) {
    cache = MEETUP_CACHE[community] = {
      date: now,
      promise: fetch(MEEUTP_URL(community))
        .then( response => {
          if (response.status >= 400) {
            const limit = response.headers.get('X-RateLimit-Limit');
            const remaining = response.headers.get('X-RateLimit-Remaining');
            if (remaining === '0') {
              console.error('Reached API limit:', limit)
            }
            return dirtyFetchCommunity(community)
          }
          else {
            return response.json().then(communityJSON => {
              communityJSON.queryId = community;
              return communityJSON;
            });
          }
        })
    }
  }

  return cache.promise;
};

const fetchCommunities = (communities) => {
  fetched = {};
  return Promise.all( communities.map( fetchCommunity ) )
            .then(communities => communities.filter(community => community));
};

module.exports.fetchCommunities = fetchCommunities;