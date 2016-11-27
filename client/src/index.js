
// Connection
var io = require('socket.io-client');
var socket = io.connect('/');

// User interface
var taaspace = require('taaspace');
var taach = require('taach');

// Helpers
var shortid = require('shortid');
var _ = require('lodash');
var utils = require('./utils');

// Init UI
var space = new taaspace.Space();
var viewElement = document.getElementById('space');
var view = new taaspace.HTMLSpaceView(space, viewElement);

// View control
var viewTouch = new taach.Touchable(view, view);
// Hack.
viewTouch.element = view._el;
viewTouch.start({
  translate: true,
  scale: true,
  rotate: true,
  view: true,
});

// Init view position
view.translateScale(
  [view.atNW(), view.atSE()],
  [space.at([200,0]), space.at([3600, 600])]
);

// Background
//var bgTaa = new taaspace.Taa();
var bg = new taaspace.SpaceHTML(space, '<h1>Monday</h1>');
bg.resize([10000, 296]);
bg.translate(bg.atMid(), bg.atMid().offset(-3000, -20));
var bgEl = view.getElementBySpaceNode(bg);
bgEl.style.backgroundColor = '#666';

var happies = [
  new taaspace.Taa('/img/icons/happy1.png'),
  new taaspace.Taa('/img/icons/happy2.png'),
  new taaspace.Taa('/img/icons/happy3.png'),
  new taaspace.Taa('/img/icons/happy4.png'),
];


socket.emit('read', {}, function (items) {
  // Initialization. Items will we our local database.

  var spaceItems = {};

  var sendUpdate = function (item, spaceItem) {
    // Update the local
    item.transform = utils.toArray(spaceItem.getGlobalTransform());
    // Inform others about the update
    socket.emit('update', item);
  };

  var showItem = function (item) {
    var image, spaceItem;

    if (item.url) {
      image = new taaspace.Taa(item.url);
      spaceItem = new taaspace.SpaceTaa(space, image);
    } else if (item.html) {
      spaceItem = new taaspace.SpaceHTML(space, item.html);
    }

    spaceItems[item.id] = spaceItem;

    var tou = new taach.Touchable(view, spaceItem);

    var mode = {};
    if (item.movable) {
      mode.translate = true;
      tou.on('transformend', function () {
        sendUpdate(item, spaceItem);
      });
    }
    if (item.sticker) {
      spaceItem.resize([128, 128]);
      mode.rotate = true;
    }
    mode.tap = true;

    tou.start(mode);

    tou.on('tap', function () {
      utils.addHappies(spaceItem, view, happies);
    });

    // Add class for styling
    var el = view.getElementBySpaceNode(spaceItem);
    var elClass = '';

    if (!item.html) {
      elClass = elClass + ' ge-tile';
    }

    if (item.mainline) {
      elClass = elClass + ' mainline';
    }
    if (item.sticker) {
      elClass = elClass + ' sticker';
    }
    if (item.today) {
      elClass = elClass + ' today';
    }
    el.className = el.className + elClass;

    spaceItem.setGlobalTransform(utils.itemToSpaceTransform(item, space));
  };

  var updateItem = function (item) {
    var si = spaceItems[item.id];
    si.setGlobalTransform(utils.itemToSpaceTransform(item, space));
  };

  var hideItem = function (item) {
    var si = spaceItems[item.id];
    si.remove();
  };

  _.each(items, showItem);

  socket.on('created', function (item) {
    console.log('created', item);
    if (!items.hasOwnProperty(item.id)) {
      items[item.id] = item;
      showItem(item);
    }
  });

  socket.on('updated', function (item) {
    console.log('updated', item);
    if (items.hasOwnProperty(item.id)) {
      updateItem(item);
    }
  });

  socket.on('deleted', function (data) {
    console.log('deleted', data);
    if (items.hasOwnProperty(item.id)) {
      delete items[item.id];
      hideItem(item);
    }
  });
});
