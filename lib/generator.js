(function () {
  "use strict";

  var _ = require("lodash"),
    chordFactory = require("./chords"),
    rhythmFactory = require("./rhythm"),
    melodyFactory = require("./melody"),
    abc = require("./abc");

  var SONG_STRUCTURE = "VVRVRVRR";
  /**

    @lyrics {Array[Array[[String]]} All the lyrics. lyrics[2][3] is the 3rd line of the 2nd verse (0-index natch)
    @inspiration {String} the one good line
    @voicePart {String} "B" for bass
  */
  var generateMusic = function (lyrics, inspiration, voicePart) {
    var key = "G";
    voicePart = "B"; // obviously it's a cheat that we secretly change this to bass

    var chords = [];
    var rhythm = [];
    var melody = [];

    var refrainChords = chordFactory.getChords();
    var refrainLyrics = lyrics[0];
    var lyricIndex = 1;
    var refrainRhythm = rhythmFactory.getRhythm(refrainLyrics);
    var refrainMelody = melodyFactory.getMelody(key, voicePart, refrainRhythm, refrainChords);
    var verseChords = chordFactory.getChords();

    _.each(SONG_STRUCTURE, function (stanzaType) {
      var verseLyrics,
        verseRhythm;

      if (stanzaType === 'R') {
        chords.push(refrainChords);
        lyrics.push(refrainLyrics);
        rhythm.push(refrainRhythm);
        melody.push(refrainMelody);
      } else if (stanzaType === 'V') {
        chords.push(verseChords);
        verseLyrics = lyrics[lyricIndex++];
        lyrics.push(verseLyrics);
        // TODO: really the rhythm and the melody should be pretty much the same
        // for all verses, with minor tweaks for varying syllable count
        verseRhythm = rhythmFactory.getRhythm(verseLyrics);
        rhythm.push(verseRhythm);
        melody.push(melodyFactory.getMelody(key, voicePart, verseRhythm, verseChords));

      } else {
          // one day a bridge?
      }

    });
    return abc.getAbc(_.flatten(lyrics), _.flatten(chords), _.flatten(melody, true), _.flatten(rhythm, true), inspiration);
  };
  exports.generateMusic = generateMusic;

}());
