'use strict';

var _utils = require('./utils');

/***********************************************************************************************************************
 *********************************************** KEYBOARD FUNCTIONS ****************************************************
 **********************************************************************************************************************/

/**
 * Sets the start keyboard.
 * @returns {Keyboar} Start keyboard.
 */
const startKeyboard = () => {
    return _utils.Extra.markdown().markup(m => m.resize().keyboard(['Menu', 'Help']));
};

/**
 * Sets the menu keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const menuKeyboard = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('User', `user/${id}`),
    // Coundown has all because when it's available the user could select between animes or mangas
    m.callbackButton('Countdown', `countdown/${id}/all`), m.callbackButton('Watchlist', `watchlist/${id}/all`), m.callbackButton('Readlist', `readlist/${id}/all`), m.callbackButton('Guide', `guide/${id}`)]));
};

/**
 * Sets the user keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const userKeyboard = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('Notify', `user/${id}/notification`), m.callbackButton('Time', `time/${id}/all`)]));
};

/**
 * Sets the time keyboard.
 * @param {Number} id - User id.
 * @param {Number} tz - Timezone id.
 * @returns {Keyboar} Bot keyboard.
 */
const timeKeyboard = (id, tz) => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('6h am', `time/${id}/06/${tz}`), m.callbackButton('Noon', `time/${id}/12/${tz}`), m.callbackButton('6h pm', `time/${id}/18/${tz}`), m.callbackButton('Midnight', `time/${id}/00/${tz}`), m.callbackButton('Remove', `time/${id}/remove`)]));
};

/**
 * Sets the location keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const locationKeyboard = id => {
    return _utils.Extra.markup(m => {
        return m.resize().keyboard([m.locationRequestButton('Send location'), 'Search it', 'Menu']);
    });
};

/**
 * Sets the update time keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const updateTimeKeyboard = id => {
    return _utils.Extra.markup(m => {
        return m.resize().keyboard(['Change time for notifications', 'Update location']);
    });
};

/**
 * Case user searches returns it more than one city, verify wich one given province.
 * @param {Number} user - User's id.
 * @param {Object[JSON]} cities - Cities that matches user search.
 * @returns {Keyboar} Message keyboard.
 */
const citiesKeyboard = (user, cities) => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard(cities.map(city => [m.callbackButton(`${city.province}`, `timezone/${user}/${city.timezone}`)])));
};

/**
 * Sets the guide keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Guide keyboard.
 */
const guideKeyboard = id => {
    const keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`), m.callbackButton('About', `about/${id}`)]));

    keyboard.disable_web_page_preview = true;

    return keyboard;
};

/**
 * Sets the countdown keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboard} Countdown keyboard.
 */
const countdownKeyboard = id => {
    return _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `menu/${id}`)]));
};

/**
 * Sets the about keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboard} Message keyboard.
 */
const aboutKeyboard = id => {
    const keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard([m.callbackButton('<', `guide/${id}`)]));

    keyboard.disable_web_page_preview = true;

    return keyboard;
};

/**
 * In watchlist this is the keyboard to attached when user requires more info.
 * @param {String} type - wich list is invoking.
 * @param {Number} id - User's id.
 * @param {Object[JSON]} content - Content data.
 * @returns Keyboard to be attached to message.
 */
const moreKeyboard = (type, id, content) => {
    let keyboard = [];

    if (0 < content.length) {
        content.forEach(one => {
            keyboard.push([_utils.Markup.callbackButton(`${one.title_english}`, `more/${one.id}/${type}`)]);
        });

        keyboard = _utils.Extra.markdown().markup(m => m.inlineKeyboard(keyboard));
    }

    // Case user selected an empty tab.
    else keyboard = undefined;

    return keyboard;
};

/**
 * This function returns all animes from users's watchlist in button format.
 * @param {Number} id - User's ID.
 * @param {Object[JSON]} animes - Anime's data.
 * @returns {Object[JSON]} Keboard containg animes.
 */
const moreAnimeKeyboard = (id, animes) => moreKeyboard('anime', id, animes);

/**
 * This function returns all mangas from users's readlist in button format.
 * @param {Number} id - User's ID.
 * @param {Object[JSON]} mangas - Manga's data.
 * @returns {Object[JSON]} Keboard containg mangas.
 */
const moreMangaKeyboard = (id, mangas) => moreKeyboard('manga', id, mangas);

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

    keyboard.reply_markup.inline_keyboard.push([_utils.Markup.callbackButton('More info', `watchlist/${id}/more/${button}`)]);
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

    keyboard.reply_markup.inline_keyboard.push([_utils.Markup.callbackButton('More info', `readlist/${id}/more/${button}`)]);
    keyboard.disable_web_page_preview = true;

    return keyboard;
};

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    startKeyboard: startKeyboard,
    menuKeyboard: menuKeyboard,
    userKeyboard: userKeyboard,
    timeKeyboard: timeKeyboard,
    locationKeyboard: locationKeyboard,
    citiesKeyboard: citiesKeyboard,
    updateTimeKeyboard: updateTimeKeyboard,
    guideKeyboard: guideKeyboard,
    countdownKeyboard: countdownKeyboard,
    moreAnimeKeyboard: moreAnimeKeyboard,
    moreMangaKeyboard: moreMangaKeyboard,
    aboutKeyboard: aboutKeyboard,
    mangaKeyboardSearch: mangaKeyboardSearch,
    animeKeyboardSearch: animeKeyboardSearch,
    characterKeyboard: characterKeyboard,
    staffKeyboard: staffKeyboard,
    watchlistKeyboard: watchlistKeyboard,
    readlistKeyboard: readlistKeyboard,
    animeKeyboardWatchlist: animeKeyboardWatchlist,
    mangaKeyboardReadlist: mangaKeyboardReadlist
};