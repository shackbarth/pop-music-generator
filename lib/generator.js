(function () {
  "use strict";

  var _ = require("lodash"),
    adaptor = require("./adaptor"),
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
  var generateMusic = function (inputLyrics, inspiration, voicePart) {
    var key = "G";
    voicePart = "B"; // obviously it's a cheat that we secretly change this to bass

    var chords = [];
    var lyrics = [];
    var rhythm = [];
    var melody = [];

    var lyricIndex = 0;

    var refrainChords = chordFactory.getChords();
    var refrainLyrics = inputLyrics[lyricIndex++];
    var refrainRhythm = rhythmFactory.getRhythm(refrainLyrics);
    var refrainMelody = melodyFactory.getMelody(key, voicePart, refrainRhythm, refrainChords);

    var verseChords = chordFactory.getChords();
    var firstVerseRhythm;
    var firstVerseMelody;

    _.each(SONG_STRUCTURE, function (stanzaType) {
      var verseLyrics;

      if (stanzaType === 'R') {
        chords.push(refrainChords);
        lyrics.push(refrainLyrics);
        rhythm.push(refrainRhythm);
        melody.push(refrainMelody);
      } else if (stanzaType === 'V') {
        chords.push(verseChords);
        verseLyrics = inputLyrics[lyricIndex++];
        lyrics.push(verseLyrics);
        if (!firstVerseRhythm) {
          firstVerseRhythm = rhythmFactory.getRhythm(verseLyrics);
          firstVerseMelody = melodyFactory.getMelody(key, voicePart, firstVerseRhythm, verseChords);
          rhythm.push(firstVerseRhythm);
          melody.push(firstVerseMelody);

        } else {
          // really the rhythm and the melody of any subsequent verse should be pretty much the same
          // for all verses, with minor tweaks for varying syllable count
          var adaptedVerse = adaptor.getAdaptedVerse(verseLyrics, firstVerseRhythm, firstVerseMelody);
          rhythm.push(adaptedVerse.rhythm);
          melody.push(adaptedVerse.melody);
        }

      } else {
          // one day a bridge?
      }

    });
    return abc.getAbc(_.flatten(lyrics), _.flatten(chords), _.flatten(melody, true), _.flatten(rhythm, true), inspiration);
  };
  exports.generateMusic = generateMusic;

}());
