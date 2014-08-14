(function () {
  "use strict";
  var optionsMap = {
    1: [3, 4, 5],
    2: [4, 5],
    3: [4, 6], // III can lead to IV or VI
    4: [1, 5], // etc
    5: [1, 6], // just like Bach would have done
    6: [2, 4, 5]
  };

  /**
    Chooses a random next chord given a previous chord
  */
  var getNextChord = function (chordInt) {
    var options = optionsMap[chordInt];
    return options[Math.floor(options.length * Math.random())];
  };

  /**
    Construct an array of 8 chords that follow conventional harmony
    TODO: the bridge typically starts on 5!
    TODO: the last chord should be a dominant, and the penultimate a predominant
  */
  var getChords = function () {
    var chords = [1];
    for (var i = 1; i < 8; i++) {
      chords.push(getNextChord(chords[i - 1]));
    }
    return chords;
  };

  exports.getChords = getChords;

}());
