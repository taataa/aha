var levelup = require('levelup');
var mkdirp = require('mkdirp');
var config = require('./config');

mkdirp.sync(config.dbDir);

module.exports = levelup(config.dbDir, {
  valueEncoding: 'json',
});
