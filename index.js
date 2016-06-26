const fs      = require('fs');
const express = require('express');
const _       = require('lodash');
const cors    = require('cors')
const app     = express();
const meetup  = require('./meetup');
const url     = require('url');


app.use(cors());

app.engine('lodash', function (filePath, options, callback) {
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    var rendered = _.template(content.toString())(options);
    return callback(null, rendered);
  });
});
app.set('views', './views');
app.set('view engine', 'lodash');

const PORT = process.env.PORT || 5000;
const COMMUNITIES = ['bogotajs', 'medellinjs', 'calijs', 'manizalesjs', 'monteriajs', 'barranquillajs', 'armeniajs', 'popayanjs', 'bucaramangajs'].join(',');
var lastQuery = {}, 
    lastQueryDate = {};


function handleRequestQuery(req) {
  const communities = req.query.meetups || COMMUNITIES;
  console.log(communities);
  const communitiesArr = communities.split(',')
  const now = Date.now();
  if (!lastQueryDate[communities]) {
    lastQueryDate[communities] = now;
    lastQuery[communities] = meetup.fetchCommunities(communitiesArr);
  }
  else if (lastQueryDate[communities] + (60 * 60 * 1000) < now) { // every Hour
    console.log('<< cache')
    lastQuery[communities] = meetup.fetchCommunities(communitiesArr);
  }
  return lastQuery[communities]
}

app.get('/', function (req, res) {
  handleRequestQuery(req)
    .then(meetups => {
      res.render('index', { meetups: _.sortBy(meetups, 'members').reverse() });
    }).catch(err => res.render(err))
});

app.get('/json', function (req, res) {
  handleRequestQuery(req)
    .then(meetups => {
      res.json({ meetups: _.sortBy(meetups, 'members').reverse() });
    }).catch(err => res.render(err))
});

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});