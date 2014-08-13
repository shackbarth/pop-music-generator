(function () {
  "use strict";
  var _ = require("lodash");

  var getRandomNoteInContext = function (min, max, currentNote, chordContext) {
    var range = _.range(min, max + 1);
    var possibilities = range.filter(function (note) {
      var isNoteInChord = _.contains([0, 2, 4], (note + 7 - chordContext) % 7);
      return note !== currentNote && isNoteInChord;
    });
    return _.sample(possibilities);
  };

  console.log(getRandomNoteInContext(2, 10, 7, 1));

}());
