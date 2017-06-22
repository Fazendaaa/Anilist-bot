'use strict';

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _telegraf = require('telegraf');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

const telegram = new _telegraf.Telegram(process.env.BOT_TOKEN, {
    agent: null,
    webhookReply: true
});

/***********************************************************************************************************************
 *********************************************** GLOBAL VARIABLES ******************************************************
 **********************************************************************************************************************/

const line = '———';

const help = "Wanna find _animes, mangas, characters, staff_ or _studios_? Try it using ANILISTbot in any of your chats, \
just type in the message field what you want!\n\n\
Try an exemple:\n\
@ANILISTbot Pokemon\n\n\
This bot has special features for you:\n\
*- notifications when new episodes releases*\n\
*- countdown for episodes*\n\
*- your own watchlist and readlist*\n\n\
Any questions? Press Menu and see the guide info for more informations.";

const welcome = `to the unofficial application for ANILIST.\n\n${help}`;

const menu = `${line} MENU ${line}\n\n\
*User:* _info about all notifications_\n\
*Countdown:* _episodes time for ariring_\n\
*Watchlist:* _saved animes_\n\
*Readlist:* _saved mangas_\n\n\
Other commands in guide.`;

const cmdMessage = `\
${line} GUIDE ${line}\n\n\
*Search features:*\n\n\
@ANILISTbot _Search..._\n\n\
/anime _anime name_\n\
/manga _manga name_\n\
/character _character name_\n\
/staff _staff name_\n\
/studio _studio name_\n\n\
*Watchlist/Readlist:*\n\n\
To see more info about your anime/manga just presse More Info button\n\n\
*Notifications:*\n\n\
Notifications are enabled for all airing animes by default. If you want to disable it open User tab then click in Notify.\n\
If you want to disable or enable specifc animes, open it watchlist and then click more info.`;

const aboutBot = `*ANILISTbot:*\n\n\
Bot news are released in: [channel](https://t.me/ANILISTbotchannel).\n\

If you want to help me out or just see more about my work:\n\
🤖 [Github](https://github.com/Fazendaaa/Anilist-bot) — See the code behind this bot\n\
😀 [My website](http://fazendaaa.me) — Check it out some of my other works\n\
🤓 [Patreon](https://www.patreon.com/Fazenda) — Helps me mantain this bot\n\n\
Any bugs or suggestions, talk to: @Farmy`;

const notQuery = '*Could not query the data*';
const notRm = '*Could remove your data. Please, try it later.*';
const defaultResponse = 'Please, feel free to search Anilist.';
const searchText = 'Search for animes, mangas, characteres, staff and studios.';
const invalid = '*Invalid anime positon. Please send anime index that you want to remove.*';
const serverError = '*Seems like our database has some issues. Please contact @Farmy about that. Or try again later*';
const empty = '*Your watchlist is empty*';
const logo_al = 'https://raw.githubusercontent.com/Fazendaaa/Anilist-bot/master/images/JPG/rectangular_error.jpg';

const searchMessage = {
    id: '1',
    title: 'Search for anything',
    type: 'article',
    input_message_content: {
        message_text: searchText,
        parse_mode: 'Markdown'
    },
    description: searchText,
    thumb_url: 'https://raw.githubusercontent.com/Fazendaaa/Anilist-bot/master/images/JPG/rectangular_search.jpg'
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
    thumb_url: 'https://raw.githubusercontent.com/Fazendaaa/Anilist-bot/master/images/JPG/rectangular_not_found.jpg'
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
 * This function cleans up a little the string, replacing emojis.
 * @param {string} string - User args.
 * @returns {string} Original message without any unwanted emoji.
 */
const messageToString = string => Buffer.from(string, 'ascii').toString('ascii').replace(/(?:=\(|:0|:o|: o|: 0)/, ': o');

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

/**
 * This function converts a number to its roman equivalent -- code from: https://stackoverflow.com/a/9083076/7092954
 * @param {Number} num - Number to be converted.
 * @returns {Number} Equivalent roman number.
 */
const romanize = num => {
    if (!+num) return false;
    var digits = String(+num).split(""),
        key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM", "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
        roman = "",
        i = 3;
    while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
};

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    dotenv: _dotenv2.default,
    telegram: telegram,
    Extra: _telegraf.Extra,
    Markup: _telegraf.Markup,
    menu: menu,
    welcome: welcome,
    help: help,
    aboutBot: aboutBot,
    defaultResponse: defaultResponse,
    searchMessage: searchMessage,
    cmdMessage: cmdMessage,
    notFound: notFound,
    notQuery: notQuery,
    notRm: notRm,
    logo_al: logo_al,
    invalid: invalid,
    serverError: serverError,
    empty: empty,
    line: line,
    removeCmd: removeCmd,
    messageToString: messageToString,
    parseToInt: parseToInt,
    notNaN: notNaN,
    romanize: romanize
};