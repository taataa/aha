var levelup = require('levelup');
var mkdirp = require('mkdirp');

mkdirp.sync('.data/db');

module.exports = levelup('.data/db', {
  valueEncoding: 'json',
});
