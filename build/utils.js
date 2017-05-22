'use strict';

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***********************************************************************************************************************
 *********************************************** GLOBAL VARIABLES ******************************************************
 **********************************************************************************************************************/

const welcome = "Welcome to _ANILISTbot_. The *UNOFFICIAL* application for searches in Anilist.\n\nType:\n/help";
const help = "Usage:\n\n\
@ANILISTbot _'anime/character/staff/studio name'_\n\
/anime _'anime name'_\n\
/character _'character name'_\n\
/staff _'staff name'_\n\
/studio _'studio name'_\n\
/watchlist ― see your saved anime list\n\
/watchlist _'index'_ ― see data about your saved anime\n\
/rm _'index'_ ― remove from your watchlist\n\
/rm _'index1', 'index2', 'index3', ..._ ― remove from your watchlist\n\
/source ― see the code behind ANILISTbot\n\n\
Any bugs or suggestions, talk to: @farmy";
const watchMessage = '\n*For more info about your animes:*\n\
*/watchlist* _index_\n\
or\n\
*/watchlist* _index1, index2, index3, ..._\n\
\n*If you want to remove any anime from your watchlist just type:*\n\
*/rm* _index_\n\
or\n\
*/rm* _index1, index2, index3, ..._\n';
const defaultResponse = 'Please, feel free to search Anilist.';
const messageSearch = 'Search for animes, character, staff and studios.';
const addedWL = 'Added to your watchlist!\nTo see it just open a chat with ANILISTbot and type /watchlist';
const invalid = '*Invalid anime positon. Please send anime index that you want to remove.*';
const serverError = '*Seems like our database has some issues. Please contact @Farmy about that. Or try again later*';
const empty = '*Your watchlist is empty*';
const logo_al = 'https://raw.githubusercontent.com/Fazendaaa/Anilist-bot/master/images/logo_al.png';
const search = {
  id: '1',
  title: 'Search for anything',
  type: 'article',
  input_message_content: {
    message_text: messageSearch,
    parse_mode: 'Markdown'
  },
  description: messageSearch,
  thumb_url: 'https://raw.githubusercontent.com/Fazendaaa/Anilist-bot/master/images/search.jpg'
};
const notFound = {
  id: '0',
  title: 'Not Found',
  type: 'article',
  input_message_content: {
    message_text: 'anilist.co',
    parse_mode: 'HTML'
  },
  description: 'Content not found',
  thumb_url: 'https://raw.githubusercontent.com/Fazendaaa/Anilist-bot/master/images/error.jpg'
};

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
const verifyString = data => 'Not available' != verifyData(data) && 'string' === typeof data ? data : 'Not available';

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
const verifyName = data => 'Not available' != verifyData(data) && 'string' === typeof data ? data : '';

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
const verifyObject = data => 'Not available' != verifyData(data) && 'object' === typeof data ? data.map(value => `> ${value}`).join('\n') : 'Not available';

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
 * Verify if the given string has an array of integers inside it.
 * @param {string} str - string to be parsed.
 * @returns an array of integers.
 */
const verifyNumbers = str => {
  const numbers = str.split(',');
  return numbers.map(data => parseToInt(data)).filter(notNaN).sort();
};

/***********************************************************************************************************************
 *********************************************** OTHER FUNCTIONS *******************************************************
 **********************************************************************************************************************/

/**
 * This function removes the '/cmd' of the command.
 * @param {string} ctx - Telegram context.
 * @returns {string} Original message without the '/cmd'.
 */
const removeCmd = ctx => ctx.message.text.replace(/(\/\w+)\s*/, '');

/**
 * This function cleans up a little the string, replacing emojis and removing HTML tags.
 * @param {string} string - User args.
 * @returns {string} Original message without any unwanted emoji.
 */
const messageToString = string => Buffer.from(string, 'ascii').toString('ascii').replace(/(?:=\(|:0|:o|: o|: 0)/, ': o').replace(/<\w+>/g, '');

/**
 * Verify if str is an Integer or not.
 * @param {string} str - string to be converted into an Integer.
 * @returns {Numbers|NaN} only integer or NaN.
 */
const parseToInt = str => /\d+$/.test(str) ? parseInt(str) : NaN;

/**
 * This function is the oppose to isNaN.
 * @param {any} data - data to be verified,
 * @returns Boolean,
 */
const notNaN = data => !isNaN(data);

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
  welcome: welcome,
  help: help,
  defaultResponse: defaultResponse,
  messageSearch: messageSearch,
  search: search,
  notFound: notFound,
  logo_al: logo_al,
  watchMessage: watchMessage,
  addedWL: addedWL,
  invalid: invalid,
  serverError: serverError,
  empty: empty,
  removeCmd: removeCmd,
  messageToString: messageToString,
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
  verifyNumbers: verifyNumbers
};