const fs        = require('fs');
const express   = require('express');
const _         = require('lodash');
const cors      = require('cors')
const app       = express();
const meetup    = require('./meetup');
const url       = require('url');
const meetupIDs = require('./meetupIDs');

app.use(cors());
app.set('json spaces', 2);

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
const COMMUNITIES = meetupIDs.join(',');
var lastQuery = {}, 
    lastQueryDate = {};


function handleRequestQuery(req) {
  const communities = req.query.meetups || COMMUNITIES;
  const communitiesArr = communities.split(',');
  return meetup.fetchCommunities(communitiesArr);
}

app.get('/', function (req, res) {
  handleRequestQuery(req)
    .then(meetups => {
      res.render('index', { meetups: _.sortBy(meetups, 'members').reverse() });
    })
    .catch(err => res.render(err));
});

app.get('/json', function (req, res) {
  handleRequestQuery(req)
    .then(meetups => {
      res.json({ meetups: _.sortBy(meetups, 'members').reverse() });
    })
    .catch(err => res.render(err));
});

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});