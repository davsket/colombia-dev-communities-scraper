const fs      = require('fs');
const express = require('express');
const _       = require('lodash');
const app     = express();
const meetup  = require('./meetup');

app.engine('lodash', function (filePath, options, callback) {
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    var rendered = _.template(content.toString())(options);
    return callback(null, rendered);
  });
});
app.set('views', './views');
app.set('view engine', 'lodash');

const COMMUNITIES = ['bogotajs', 'medellinjs', 'calijs', 'manizalesjs', 'monteriajs', 'barranquillajs', 'armeniajs', 'popayanjs', 'bucaramangajs'];
var lastQuery, 
    lastQueryDate;

app.get('/', function (req, res) {
  const now = Date.now();
  if (!lastQueryDate) {
    lastQueryDate = now;
    lastQuery = meetup.fetchCommunities(COMMUNITIES);
  }
  else if (lastQueryDate + (60 * 60 * 1000) < now) { // every Hour
    console.log('<< cache')
    lastQuery = meetup.fetchCommunities(COMMUNITIES);
  }
  lastQuery.then(meetups => {
    console.log(meetups)
    res.render('index', { meetups: _.sortBy(meetups, 'members').reverse() });
  })
});

app.listen(3005, function () {
  console.log('Example app listening on port 3000!');
});