(function () {

  var _ = require("lodash"),
    phraseSyllables = require("../../twitter-poetry/lib/twitter_poetry").phraseSyllables; // TODO npm install

  var Hypher = require('hypher'),
    english = require('hyphenation.en-gb'),
    h = new Hypher(english);

  /**
    0 = never choose off-beat notes
    1 = choose off-beat notes with the same frequency as on-beat notes
    2 = be twice as likely to choose off-beat notes
    999999 = always choose off-beat notes
  */
  var SYNCOPATION_PREFERENCE = 2;
  var TOTAL_AVAILABLE_BEATS = 16;
  var END_SPACE_PREFERENCE = 3;

  /**
    Takes a word like marathon, identifies it as a 3-syllable word, and returns a rhythm for laying
    out that word, like [0, 2, 3]. The zero is the first impulse, which we don't know yet if that's
    on a beat or offbeat, or which beat. But in any case, the next impulse comes 2 eighth notes later,
    and the last impulse is an eighth note after that.

  */
  var getWordCluster = function (word) {
    var wordLength = h.hyphenate(word).length,
      wordCluster = [0];

    _.times(wordLength - 1, function (n) {
      // each note within a word is either an eight note or a quarter note
      wordCluster.push(wordCluster[n] + 1 + Math.floor(Math.random() * 2))
    });

    return wordCluster;
  };

  // the spaces before, after, and between the words
  var getBetweenWordSpaces = function (spacesCount, beatsToFill) {
    var betweenWordSpaces = [];
    _.times(spacesCount, function (n) {
      betweenWordSpaces.push(0);
    });
    _.times(beatsToFill, function (n) {
      var spaceToAddTo = Math.min(Math.floor(Math.random() * spacesCount * END_SPACE_PREFERENCE), spacesCount - 1);
      betweenWordSpaces[spaceToAddTo]++;
    });
    return betweenWordSpaces;
  }

  /**
    Each line is two bars of 4/4. Rhythm can happen on eighth notes. The notes are 0-indexed.
    So 0 is the downbeat of the first bar. 3 is the upbeat of beat 2 of the first bar.
    {0, 3} means that there's a note on the downbeat and the upbeat of 2.
    {1, 8} means that there's a note on the upbeat of 1 and the downbeat of the second bar
    these numbers can therefore range from 0 to 15.

    @lyrics {Array{String}}
  */
  var getRhythm = function (lyrics) {
    var rhythm = [];
    _.each(lyrics, function (line) {
      var words = line.split(/\s+/);
      var wordClusters = _.map(words, getWordCluster);
      var lineSyllableCount = _.reduce(words, function (memo, word) {
        return memo + h.hyphenate(word).length;
      }, 0);
      var betweenWordSpaces = getBetweenWordSpaces(words.length + 1, TOTAL_AVAILABLE_BEATS - lineSyllableCount);
      var rhythmLine = [];
      var ticker = 0;
      _.times(words.length, function (n) {
        ticker += betweenWordSpaces[n];
        _.each(wordClusters[n], function (impulseIndex) {
          rhythmLine.push(ticker + impulseIndex);
        });
        ticker += _.last(wordClusters[n]);
        ticker++;
      });
      rhythm.push(rhythmLine);
    });
    return rhythm;
  };

  exports.getRhythm = getRhythm;

}());
