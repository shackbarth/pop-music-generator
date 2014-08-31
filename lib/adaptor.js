(function () {

  var getSyllableCount = require('../../twitter-poetry/lib/twitter_poetry').getSyllableCount, // TODO
    _ = require("lodash");
  var TOTAL_AVAILABLE_BEATS = 16;

  /**
    Adapts a new set of lyrics to a pre-existing melody and rhythm
  */
  var getAdaptedVerse = function (lyrics, baseRhythm, baseMelody) {
    var newRhythm = [];
    var newMelody = [];
    _.times(lyrics.length, function (n) {
      var lyricsLine = lyrics[n];
      var rhythmLine = _.clone(baseRhythm[n]);
      var melodyLine = _.clone(baseMelody[n]);
      var syllables = getSyllableCount(lyricsLine);
      var syllableDifference = syllables - baseRhythm[n].length;
      if (syllableDifference < 0) {
        // the new line is shorter. Chop off some notes
        rhythmLine.splice(rhythmLine.length + syllableDifference, -1 * syllableDifference);
        melodyLine.splice(melodyLine.length + syllableDifference, -1 * syllableDifference);
      }
      while (syllableDifference > 0) {
        // the new line is longer. Find a place to add new events unobtusively.
        // Preferably right after the last event
        var maxRhythm = rhythmLine[rhythmLine.length - 1];
        if (maxRhythm === TOTAL_AVAILABLE_BEATS - 1) {
          // uh-oh, ran out of space at the end. onto plan B.
          break;
        }
        rhythmLine.push(maxRhythm + 1);
        melodyLine.push(melodyLine[melodyLine.length - 1]) // TODO: better note choice than always the same
        syllableDifference--;
      }
      while (syllableDifference > 0) {
        // plan B: add events into gaps starting from the back
        var lastGap = _.last(_.difference(_.range(0, TOTAL_AVAILABLE_BEATS - 1), rhythmLine));
        var gapIndex = rhythmLine.length + lastGap - TOTAL_AVAILABLE_BEATS + 1; // magic
        rhythmLine.splice(gapIndex, 0, lastGap);
        melodyLine.splice(gapIndex, 0, melodyLine[gapIndex - 1] || melodyLine[0]); // just use anything if gapIndex === 0
        syllableDifference--;
      }

      newRhythm.push(rhythmLine);
      newMelody.push(melodyLine);
    });
    return {rhythm: newRhythm, melody: newMelody};
  };

  exports.getAdaptedVerse = getAdaptedVerse;


}());
