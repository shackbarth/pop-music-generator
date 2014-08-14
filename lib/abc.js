(function () {
  "use strict";

  var _ = require("lodash"),
    Hypher = require('hypher'),
    english = require('hyphenation.en-us'),
    hypher = new Hypher(english);

  var PREAMBLE1 = "X:1\nT:";
  var PREAMBLE2 = "\nM:4/4\nL:1/8\nK:G\n";

  var chordMap = {
    1: "G",
    2: "Am",
    3: "Bm",
    4: "C",
    5: "D",
    6: "Em"
  };

  var noteMap = {
    2: "A,",
    3: "B,",
    4: "C",
    5: "D",
    6: "E",
    7: "F",
    8: "G",
    9: "A",
    10: "B",
    11: "c",
    12: "d"
  };

  /**
    melody, rhythm, and lyrics are parallel lists indexed by note
    chords are indexed by line

    @lyrics {Array[String]}
    @chords {Array[Integer]}
    @melody {Array[Array[Integer]]}
    @rhythm {Array[Array[Integer]]}
    @inspiration {String}
   */
  var getAbc = function (lyrics, chords, melody, rhythm, inspiration) {
    var abc = PREAMBLE1 + inspiration + PREAMBLE2;
    _.times(rhythm.length, function (n) {
      var lineLyrics = lyrics[n].split(/\s+/);
      var lineChords = [chords[n * 2], chords[(n * 2) + 1]];
      var lineRhythm = rhythm[n];
      var lineMelody = melody[n];
      var chord1 = "\"" + chordMap[chords[n * 2]] + "\"";
      var chord2 = "\"" + chordMap[chords[n * 2 + 1]] + "\"";

      var wordIndex = 0;
      var musicString = "";
      var lyricsString = "";
      var syllableIndex = 0;
      var eighthNotes = 0;
      var measure = 0;
      _.times(lineRhythm.length, function (j) {
        var noteDuration = 0;
        var restDuration = 0;
        if (j === 0 && lineRhythm[j] > 0) {
          noteDuration = 0;
          musicString += "z" + (lineRhythm[0] === 1 ? "" : String(lineRhythm[0]));
          eighthNotes += lineRhythm[0];
        }
        var noteLetter = noteMap[lineMelody[j]];

        if (j === lineRhythm.length - 1) {
          noteDuration = 16 - lineRhythm[j];
        } else {
          noteDuration = lineRhythm[j + 1] - lineRhythm[j];
        }
        if (noteDuration > 1 && eighthNotes === 7) {
          // notes on the very last upbeat of a bar should always be just 1 beat long
          restDuration = noteDuration - 1;
          noteDuration = 1;
        } else if (noteDuration > 2) {
          restDuration = noteDuration - 2;
          noteDuration = 2;
        }
        if (noteDuration > 0) {
          if (noteDuration + eighthNotes === 8) {
            musicString += (noteLetter + String(noteDuration) + "|");
            if (++measure === 1) {
              musicString += chord2;
            }
            eighthNotes = 0;
          } else if (noteDuration + eighthNotes > 8) {
            musicString += noteLetter + String(8 - eighthNotes);
            noteDuration -= (8 - eighthNotes);
            musicString += "|";
            if (++measure === 1) {
              musicString += chord2;
            }
            eighthNotes = 0;
            // there  has to be at least 1 left over...
            musicString += noteLetter + (noteDuration === 1 ? "" : String(noteDuration));
            eighthNotes += noteDuration;
          } else {
            musicString += noteLetter + (noteDuration === 1 ? "" : String(noteDuration));
            eighthNotes += noteDuration;
          }
        }

        if (restDuration > 0) {
          if (restDuration + eighthNotes === 8) {
            musicString += "z" + String(restDuration) + "|";
            if (++measure === 1) {
              musicString += chord2;
            }
            eighthNotes = 0;
          } else {
            musicString += "z" + (restDuration === 1 ? "" : String(restDuration));
            eighthNotes += restDuration;
          }
        }

        var syllableArray = hypher.hyphenate(lineLyrics[wordIndex]);
        var syllable = syllableArray[syllableIndex];
        lyricsString += syllable;

        if (syllableIndex < syllableArray.length - 1) {
          lyricsString += "-";
          syllableIndex++;
        }
        else {
          lyricsString += " ";
          wordIndex++;
          syllableIndex = 0;
        }
      });
      abc += chord1 + musicString + "\n" + "w: " + lyricsString + "\n";
    });
    return abc;
  };
  exports.getAbc = getAbc;
}());
