var nudged = require('nudged');
var taaspace = require('taaspace');
var taach = require('taach');

var spaceHappies = null;
var spaceTouches = null;
var spaceHappiesParent = null;

exports.itemToSpaceTransform = function (item, space) {
  // Return
  //   a taaspace.SpaceTransform
  var arr = [
    item.transform[0], item.transform[1],
    item.transform[2] * 296, item.transform[3] * 296
  ];

  var rawTransform = nudged.createFromArray(arr);
  return new taaspace.SpaceTransform(space, rawTransform);
};

exports.toArray = function (spaceTrans) {
  // Parameters:
  //   spaceTrans
  //     a taataa.SpaceTransform
  var t = spaceTrans.T;

  return [t.s, t.r, t.tx / 296, t.ty / 296];
};

exports.hideHappies = function (except) {
  if (typeof except === 'undefined') {
    except = -1;
  }

  spaceHappies.forEach(function (spaceHappy, i) {
    if (i !== except) {
      spaceHappy.remove();
      spaceTouches[i].stop();
    }
  });

  if (except === -1) {
    spaceHappies = null;
  }
};

exports.addHappies = function (spaceItem, view, happies) {

  if (spaceHappies === null) {
    spaceTouches = [];
    spaceHappies = happies.map(function (happy, i) {
      var s = new taaspace.SpaceTaa(spaceItem, happy);
      s.resize([64, 64]);
      s.translate(
        [s.atSW(), s.atNE()],
        [spaceItem.atSW().offset(i * 64, 0), spaceItem.atSW().offset(64 + i * 64, -64)]
      );

      var touch = new taach.Touchable(view, s);
      spaceTouches.push(touch);
      touch.start({
        tap: true
      });
      touch.on('tap', function () {
        exports.hideHappies(i)
      });

      return s;
    });
  } else {
    // Hide
    exports.hideHappies();
  }
};
