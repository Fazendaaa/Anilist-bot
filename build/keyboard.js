'use strict';

var _utils = require('./utils');

/***********************************************************************************************************************
 *********************************************** KEYBOARD FUNCTIONS ****************************************************
 **********************************************************************************************************************/

/**
 * Sets the menu keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const menuKeyboard = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('User', `user/${id}`), m.callbackButton('Watchlist', `watchlist/${id}/all`), m.callbackButton('Readlist', `readlist/${id}/all`), m.callbackButton('Guide', `guide/${id}`)]));
};

/**
 * Sets the about keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const aboutKeyboard = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`)]));
};

/**
 * Sets the cmd keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const cmdKeyboard = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`)]));
};

/**
 * This function allow the buttons search for the given id character.
 * @param {string} id - Character id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const characterKeyboard = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('Description', `search/${id}/character/description`)]));
};

/**
 * This function allow the buttons search for the given id staff.
 * @param {string} id - Staff id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const staffKeyboard = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('Description', `search/${id}/staff/description`)]));
};

/***********************************************************************************************************************
 ******************************************** SEARCH KEYBOARD FUNCTIONS ************************************************
 **********************************************************************************************************************/

/**
 * This function allow the buttons search for the given id manga.
 * @param {string} id - Manga id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const mangaKeyboardSearch = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('Description', `search/${id}/manga/description`), m.callbackButton('Genres', `search/${id}/manga/genres`), m.callbackButton('Users', `search/${id}/manga/users`), m.callbackButton('Readlist', `subscribe/${id}/manga`)]));
};

/**
 * This function allow the buttons search for the given id anime.
 * @param {string} id - Anime id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const animeKeyboardSearch = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('Description', `search/${id}/anime/description`), m.callbackButton('Genres', `search/${id}/anime/genres`), m.callbackButton('Users', `search/${id}/anime/users`), m.callbackButton('Watchlist', `subscribe/${id}/anime`)]));
};

/***********************************************************************************************************************
 ********************************************* LIST KEYBOARD FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * This function allow the buttons search for the given id anime.
 * @param {string} id - Anime id.
 * @param {string} button - Wich button was pressed.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const animeKeyboardWatchlist = (id, button) => {
    let keyboard;

    switch (button) {
        case 'all':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('Notify', `notify/${id}/all`), m.callbackButton('Info', `info/${id}/anime/info`), m.callbackButton('About', `info/${id}/anime/about`), m.callbackButton('Remove', `unsubscribe/${id}/anime`)]));
            break;
        case 'info':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('Notify', `notify/${id}/info`), m.callbackButton('All', `info/${id}/anime/all`), m.callbackButton('About', `info/${id}/anime/about`), m.callbackButton('Remove', `unsubscribe/${id}/anime`)]));
            break;
        case 'about':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('Notify', `notify/${id}/about`), m.callbackButton('All', `info/${id}/anime/all`), m.callbackButton('Info', `info/${id}/anime/info`), m.callbackButton('Remove', `unsubscribe/${id}/anime`)]));
            break;

    }

    return keyboard;
};

/**
 * This function allow the buttons search for the given id manga.
 * @param {string} id - Manga id.
 * @param {string} button - Wich button was pressed.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const mangaKeyboardReadlist = (id, button) => {
    let keyboard;

    switch (button) {
        case 'all':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('Info', `info/${id}/manga/info`), m.callbackButton('About', `info/${id}/manga/about`), m.callbackButton('Remove', `unsubscribe/${id}/manga`)]));
            break;
        case 'info':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('All', `info/${id}/manga/all`), m.callbackButton('About', `info/${id}/manga/about`), m.callbackButton('Remove', `unsubscribe/${id}/manga`)]));
            break;
        case 'about':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('All', `info/${id}/manga/all`), m.callbackButton('Info', `info/${id}/manga/info`), m.callbackButton('Remove', `unsubscribe/${id}/manga`)]));
            break;
    }

    return keyboard;
};

/**
 * This function allow the buttons search for the given id anime.
 * @param {string} button - button it's calling.
 * @param {string} id - User id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const watchlistKeyboard = (button, id) => {
    let keyboard;

    switch (button) {
        case 'all':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('Airing', `watchlist/${id}/airing`), m.callbackButton('Soon', `watchlist/${id}/soon`), m.callbackButton('Completed', `watchlist/${id}/completed`), m.callbackButton('Cancelled', `watchlist/${id}/cancelled`)]));
            break;
        case 'airing':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('All', `watchlist/${id}/all`), m.callbackButton('Soon', `watchlist/${id}/soon`), m.callbackButton('Completed', `watchlist/${id}/completed`), m.callbackButton('Cancelled', `watchlist/${id}/cancelled`)]));
            break;
        case 'soon':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('All', `watchlist/${id}/all`), m.callbackButton('Airing', `watchlist/${id}/airing`), m.callbackButton('Completed', `watchlist/${id}/completed`), m.callbackButton('Cancelled', `watchlist/${id}/cancelled`)]));
            break;
        case 'completed':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('All', `watchlist/${id}/all`), m.callbackButton('Airing', `watchlist/${id}/airing`), m.callbackButton('Soon', `watchlist/${id}/soon`), m.callbackButton('Cancelled', `watchlist/${id}/cancelled`)]));
            break;
        case 'cancelled':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('All', `watchlist/${id}/all`), m.callbackButton('Airing', `watchlist/${id}/airing`), m.callbackButton('Soon', `watchlist/${id}/soon`), m.callbackButton('Completed', `watchlist/${id}/completed`)]));
            break;
    }

    keyboard.disable_web_page_preview = true;

    return keyboard;
};

/**
 * This function allow the buttons search for the given id anime.
 * @param {string} button - button it's calling.
 * @param {string} id - User id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const readlistKeyboard = (button, id) => {
    let keyboard;

    switch (button) {
        case 'all':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('Publishing', `readlist/${id}/publishing`), m.callbackButton('Soon', `readlist/${id}/soon`), m.callbackButton('Completed', `readlist/${id}/completed`), m.callbackButton('Cancelled', `readlist/${id}/cancelled`)]));
            break;
        case 'publishing':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('All', `readlist/${id}/all`), m.callbackButton('Soon', `readlist/${id}/soon`), m.callbackButton('Completed', `readlist/${id}/completed`), m.callbackButton('Cancelled', `readlist/${id}/cancelled`)]));
            break;
        case 'soon':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('All', `readlist/${id}/all`), m.callbackButton('Publishing', `readlist/${id}/publishing`), m.callbackButton('Completed', `readlist/${id}/completed`), m.callbackButton('Cancelled', `readlist/${id}/cancelled`)]));
            break;
        case 'completed':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('All', `readlist/${id}/all`), m.callbackButton('Publishing', `readlist/${id}/publishing`), m.callbackButton('Soon', `readlist/${id}/soon`), m.callbackButton('Cancelled', `readlist/${id}/cancelled`)]));
            break;
        case 'cancelled':
            keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('All', `readlist/${id}/all`), m.callbackButton('Publishing', `readlist/${id}/publishing`), m.callbackButton('Soon', `readlist/${id}/soon`), m.callbackButton('Completed', `readlist/${id}/completed`)]));
            break;
    }

    keyboard.disable_web_page_preview = true;

    return keyboard;
};

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    menuKeyboard: menuKeyboard,
    aboutKeyboard: aboutKeyboard,
    cmdKeyboard: cmdKeyboard,
    mangaKeyboardSearch: mangaKeyboardSearch,
    animeKeyboardSearch: animeKeyboardSearch,
    characterKeyboard: characterKeyboard,
    staffKeyboard: staffKeyboard,
    watchlistKeyboard: watchlistKeyboard,
    readlistKeyboard: readlistKeyboard,
    animeKeyboardWatchlist: animeKeyboardWatchlist,
    mangaKeyboardReadlist: mangaKeyboardReadlist
};