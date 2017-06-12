'use strict';

// Remove HTML tags from text

var _striptags = require('striptags');

var _striptags2 = _interopRequireDefault(_striptags);

var _removeMarkdown = require('remove-markdown');

var _removeMarkdown2 = _interopRequireDefault(_removeMarkdown);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _humanizeDuration = require('humanize-duration');

var _humanizeDuration2 = _interopRequireDefault(_humanizeDuration);

var _utils = require('./utils');

var _reply = require('./reply');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***********************************************************************************************************************
 *********************************************** VERIFY FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * Returns data if it is available or error message when not.
 * @param {any} data - any data that must be verified wether or not is available.
 * @returns {any|string} Original content or error message.
 */
const verifyData = data => undefined != data && null != data && isNaN(data) ? data : 'Not available';

/**
 * Returns data if it is available or error message when not.
 * @param {number} data - any data that must be verified wether or not is available.
 * @returns {number|string} Original content or error message.
 */
const verifyNumber = data => undefined != data && null != data && 'number' === typeof data ? data : 'Not available';

/**
 * Verify if string is available or not.
 * @param {string} data - String to be verified.
 * @returns {string} Original string or error message.
 */
const verifyString = data => 'Not available' != data && 'string' === typeof data ? (0, _removeMarkdown2.default)((0, _striptags2.default)(data)) : 'Not available';

/**
 * Verify if string is available or not.
 * @param {string} data - String to be verified.
 * @returns {string} Original string or nothing.
 */
const verifyEmptyString = data => 'Not available' != data && 'string' === typeof data ? (0, _removeMarkdown2.default)((0, _striptags2.default)(data)) : '';

/**
 * Verify if data is a string or a number and wheter is available or not.
 * @param {string|number} data - String to be verified.
 * @returns {string} Original string or error message.
 */
const verifyStringNumber = data => 'Not available' != verifyString(data) || 'Not available' != verifyNumber(data) ? data : 'Not available';

/**
 * Verify if name is available or not.
 * @param {string} data - String to be verified.
 * @returns {string} Original string or nothing.
 */
const verifyName = data => 'Not available' != verifyData(data) && 'string' === typeof data ? `- _Name_: *${data}*` : '';

/**
 * Verify if title is available or not.
 * @param {string} data - Title to be verified.
 * @returns {string} Original string parsed to title markdwon or error message.
 */
const verifyTitle = data => 'Not available' != verifyString(data) ? `*${data}*\n` : '';

/**
 * Verify if japanese title is available or not.
 * @param {string} data - Title to be verified.
 * @returns {string} Original string parsed to title markdwon or error message.
 */
const verifyJPTitle = data => 'Not available' != verifyString(data) ? `🇯🇵 *${data}*\n` : '';
/*  The double rectangles before data are the representative emoji for the japanese flag */

/**
 * Verify if english title is available or not.
 * @param {string} data - Title to be verified.
 * @returns {string} Original string parsed to title markdwon or error message.
 */
const verifyENTitle = data => 'Not available' != verifyString(data) ? `🇬🇧 *${data}*\n` : '';
/*  The double rectangles before data are the representative emoji for the british flag */

/**
 * Verify if object is available or not
 * @param {Object[]} data - Object to be verified.
 * @returns {string} Object data parsed to string or error message.
 */
const verifyObject = data => 'Not available' != verifyData(data) && 'object' === typeof data ? data.filter(value => '' != value).map(value => `> ${value}`).join('\n') : 'Not available';

/**
 * Verify if data is available, parsing it to button standard.
 * @param {string} message - Message title.
 * @param {string|number} data - Message value.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyButton = (message, data) => 'Not available' != verifyStringNumber(data) ? `> ${message}: ${data}\n` : '';

/**
 * Verify if data is available, parsing it to message standard.
 * @param {string} message - Message title.
 * @param {string} data - Message value.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyMD = (message, data) => 'Not available' != verifyStringNumber(data) ? `- _${message}_: *${data}*\n` : '';

/**
 * Verify if YouTube link is available parsing it to trailer link.
 * @param {string} data - Youtube id.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyYT = data => 'Not available' != verifyString(data) ? `🎥 [Trailer](https://youtu.be/${data})\n` : '';
/*  The brackets before Trailer are the camera emoji    */

/**
 * Verify if website link is available parsing it to trailer link.
 * @param {string} data - Website link.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyWS = data => 'Not available' != verifyString(data) ? `[Website](${data}})` : '';

/**
 * Parse it Anilist date format to one more readable
 * @param {string} message - Message title.
 * @param {string} data - Message value.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyDate = (message, data) => 'Not available' != verifyString(data) ? `- _${message}_: *${(0, _moment2.default)(data).format('MMMM Do YYYY')}*\n` : '';

/**
 * Verify if the given anime is rated as adult content.
 * @param {string} data - Anime flag.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyAdult = data => data ? '⚠️ *Rated as adult content*\n' : '';

/**
 * Verify the number of episodes of given anime.
 * @param {string} data - Anime number of episodes.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyEpisodes = data => 0 != data ? verifyMD('Episodes', data) : '';

/**
 * Verify the score of given anime.
 * @param {string} data - Anime score.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyScore = data => 0 != data ? verifyMD('Score', data) : '';

/**
 * Verify the chapters of given manga.
 * @param {string} data - Manga chapters.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyChapters = data => 0 != data ? verifyMD('Chapters', data) : '';

/**
 * Verify the volumes of given manga.
 * @param {string} data - Manga volumes.
 * @returns {string} Message parsed or nothing to be printed.
 */
const verifyVolumes = data => 0 != data ? verifyMD('Volumes', data) : '';

/**
 * Verify if the given string has an array of integers inside it.
 * @param {string} str - string to be parsed.
 * @returns an array of integers.
 */
const verifyNumbers = str => {
  const numbers = str.split(',');
  return numbers.map(data => (0, _utils.parseToInt)(data)).filter(_utils.notNaN).sort();
};

/**
 * Verify if the given anime has an link to be watched online.
 * @param {Number} id - Anime id.
 * @returns {String} Anime watch link.
 */
const verifyWatchLink = data => {
  if (data.hasOwnProperty('external_links')) {
    const link = [];

    for (let i in data.external_links) link.push([`[${data.external_links[i].site}]`, `(${data.external_links[i].url})`]);

    if (0 < link.length) {
      for (let i in link) link[i] = link[i].join('');

      return '- _More of it online_: '.concat(link.join(', '));
    } else return '';
  } else return '';
};

/**
 * Verify if the given anime is airing and shows it the next episode.
 * @param {Number} data - Anime data.
 * @returns {String} Anime info about next episode.
 */
const verifyNextEpisode = data => {
  if (data) return `${verifyMD('Next Episode', data.next_episode)}${verifyDate('New release in:', data.time)}`;else return '';
};

/**
 * Verify if the character role is available.
 * @param {String} rol - Character role.
 * @returns {String} Character role seted.
 */
const verifyRole = role => verifyData(role) != 'Not Available' ? ` - _Role_: ${role}` : '';

/**
 * Verify wheter or not countdown is available.
 * @param {String} data - Anime coundown time in seconds.
 * @returns {String} Formated data to be printed.
 */
const verifyCountdown = data => verifyData(data) != 'Not Available' ? ` - _Countdown_: *${(0, _humanizeDuration2.default)(data * 1000, { units: ['d', 'h', 'm'], round: true })}*` : '';

/**
 * Verify wheter or not type is available.
 * @param {String} value - Value of content.
 * @param {String} type - Type of content.
 * @returns {String} Formated data to be printed.
 */
const verifyType = (value, type) => verifyData(type) != 'Not Available' && verifyData(value) != 'Not Available' ? `📺 *${type}*(${value})\n` : '';

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
  verifyData: verifyData,
  verifyNumber: verifyNumber,
  verifyString: verifyString,
  verifyStringNumber: verifyStringNumber,
  verifyName: verifyName,
  verifyTitle: verifyTitle,
  verifyJPTitle: verifyJPTitle,
  verifyENTitle: verifyENTitle,
  verifyObject: verifyObject,
  verifyButton: verifyButton,
  verifyMD: verifyMD,
  verifyYT: verifyYT,
  verifyWS: verifyWS,
  verifyDate: verifyDate,
  verifyAdult: verifyAdult,
  verifyNumbers: verifyNumbers,
  verifyWatchLink: verifyWatchLink,
  verifyNextEpisode: verifyNextEpisode,
  verifyEpisodes: verifyEpisodes,
  verifyScore: verifyScore,
  verifyChapters: verifyChapters,
  verifyVolumes: verifyVolumes,
  verifyRole: verifyRole,
  verifyEmptyString: verifyEmptyString,
  verifyCountdown: verifyCountdown,
  verifyType: verifyType
};