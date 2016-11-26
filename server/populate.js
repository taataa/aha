
var leveldown = require('leveldown');
var levelup = require('levelup');
var mkdirp = require('mkdirp');
var config = require('./config');
var fixture = require('./fixture.json');

// Clear the database before population
leveldown.destroy(config.dbDir, function (err) {
  if (err) { return console.error(err); }

  mkdirp.sync(config.dbDir);

  var db = levelup(config.dbDir, {
    valueEncoding: 'json',
  });

  var ops = fixture.map(function (item) {
    return {
      type: 'put',
      key: item.id,
      value: item
    };
  });

  db.batch(ops, function (err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Database populated successfully with', ops.length, 'items.');
  });

});
