(function () {
  "use strict";
  var _ = require("lodash");

  /**
   Returns a list of lines.
   Each line is a list of integers that represent the pitches of the various notes on that line.
   1 is do, 2 is re, 3 is mi. 8 is do in the higher octave, etc.

   Each voice part will have its own range limitations

   @key {String}
   @voicePart {String} "S" "A" "T" or "B"
   @verseCount {Integer}
   @rhythm {Array{Array{Integer}}}
   @chords {Array{Integer}} 
  */
  var getMelody = function(key, voicePart, verseCount, rhythmLines, allChords) {

    // TODO: allow other voice parts and keys
    if(key !== "G" || voicePart !== "B") {
      return null;
    }
    var lowestNote = 2; // low A
    var highestNote = 12; // high D

    var melody = [];
    var chosenNote;
    var previousNote;
    _.times(verseCount, function (verseIndex) {
      var melodyLine = [];
      var rhythm = rhythmLines[verseIndex];
      var chords =[allChords[verseIndex * 2], allChords[(verseIndex * 2) + 1]];
      // can't break each line out into separate function because the whole song has to be like organic
      _.times(rhythm.length, function (n) {
        var rhythmEvent = rhythm[n];
        var chordContext = rhythmEvent < 8 ? chords[0] : chords[1];
        var random = Math.random();
        if (!chosenNote) {
          // start on the upper octave
          chosenNote = getRandomNoteInContext(highestNote - 7, highestNote, -1, chordContext);

        } else if (random < 0.4) {
          // jump to a note within a fourth in the correct context
          chosenNote = getRandomNoteInContext(
            Math.max(lowestNote, previousNote - 3),
            Math.min(highestNote, previousNote + 3), 
            previousNote,
            chordContext);

        } else if (random < 0.6 && previousNote < highestNote) {
          // go up a note
          chosenNote = previousNote + 1;

        } else if (random < 0.8 && previousNote > lowestNote) {
          // go down a note
          chosenNote = previousNote - 1;

        } else {
          // stay on the same note
          chosenNote = previousNote;
        }
        melodyLine.push(chosenNote);
        previousNote = chosenNote;
      });
      melody.push(melodyLine);
    }); 
    return melody;
  };


  var getRandomNoteInContext = function (min, max, currentNote, chordContext) {
    var range = _.range(min, max + 1);
    var possibilities = range.filter(function (note) {
      var isNoteInChord = _.contains([0, 2, 4], (note + 7 - chordContext) % 7);
      return note !== currentNote && isNoteInChord;
    });
    return _.sample(possibilities);
  };

  exports.getMelody = getMelody;

}());
