'use strict';

import {
    Extra,
    Markup
} from './utils';

/***********************************************************************************************************************
 *********************************************** KEYBOARD FUNCTIONS ****************************************************
 **********************************************************************************************************************/

/**
 * Sets the start keyboard.
 * @returns {Keyboar} Start keyboard.
 */
const startKeyboard = () => {
    return Extra.markdown().markup(m =>
        m.resize().keyboard(['Menu', 'Help'])
    )
}

/**
 * Sets the menu keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const menuKeyboard = id => {
    let keyboard = [];

    keyboard.push([
        Markup.callbackButton('User', `user/${id}`),
        // Coundown has all because when it's available the user could select between animes or mangas
        Markup.callbackButton('Countdown', `countdown/${id}/all`),
        Markup.callbackButton('Guide', `guide/${id}`)
    ]);

    keyboard.push([
        Markup.callbackButton('Watchlist', `watchlist/${id}/all`),
        Markup.callbackButton('Readlist', `readlist/${id}/all`)
    ]);

    return Extra.markdown().markup(m => m.inlineKeyboard(keyboard));
}

/**
 * Sets the user keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const userKeyboard = id => {
    return Extra.markdown().markup(m => m.inlineKeyboard([
        m.callbackButton('<', `menu/${id}`),
        m.callbackButton('Notify', `user/${id}/notification`),
        m.callbackButton('Time', `time/${id}/all`)
    ]));
}

/**
 * Sets the period keyboard.
 * @param {Number} tz - Timezone id.
 * @returns {Keyboar} Bot keyboard.
 */
const periodKeyboard = (id, tz) => {
    return Extra.markdown().markup(m => m.inlineKeyboard([
        m.callbackButton('AM', `period/AM/${tz}`),
        m.callbackButton('PM', `period/PM/${tz}`),
        m.callbackButton('Remove', `time/${id}/remove`)
    ]));
}

/**
 * Sets the time keyboard.
 * @param {String} period - User period.
 * @param {Number} tz - Timezone id.
 * @returns {Keyboar} Bot keyboard.
 */
const timeKeyboard = (period, tz) => {
    let add = 0;
    let keyboard = [];

    if('PM' == period)
        add += 12;

    keyboard.push([
        Markup.callbackButton('1h', `time/${1+add}/${tz}`),
        Markup.callbackButton('2h', `time/${2+add}/${tz}`),
        Markup.callbackButton('3h', `time/${3+add}/${tz}`),
        Markup.callbackButton('4h', `time/${4+add}/${tz}`)
    ]);
    
    keyboard.push([
        Markup.callbackButton('5h', `time/${5+add}/${tz}`),
        Markup.callbackButton('6h', `time/${6+add}/${tz}`),
        Markup.callbackButton('7h', `time/${7+add}/${tz}`),
        Markup.callbackButton('8h', `time/${8+add}/${tz}`)
    ]);
    
    keyboard.push([
        Markup.callbackButton('9h', `time/${9+add}/${tz}`),
        Markup.callbackButton('10h', `time/${10+add}/${tz}`),
        Markup.callbackButton('11h', `time/${11+add}/${tz}`),
        Markup.callbackButton('12h', `time/${12+add}/${tz}`)
    ]);
    
    return Extra.markdown().markup(m => m.inlineKeyboard(keyboard));
}

/**
 * Sets the location keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const locationKeyboard = id => {
    return Extra.markup(m => {return m.resize().keyboard([
        m.locationRequestButton('Send location'),
        'Search it',
        'Menu'
    ])});
}

/**
 * Sets the update time keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Bot keyboard.
 */
const updateTimeKeyboard = id => {
    return Extra.markup(m => {return m.resize().keyboard([
        'Change time for notifications',
        'Update location'
    ])});
}

/**
 * Case user searches returns it more than one city, verify wich one given province.
 * @param {Number} user - User's id.
 * @param {Object[JSON]} cities - Cities that matches user search.
 * @returns {Keyboar} Message keyboard.
 */
const citiesKeyboard = (user, cities) => {
    return Extra.markdown().markup(m => m.inlineKeyboard(
        cities.map(city => [m.callbackButton(`${city.province}`, `timezone/${user}/${city.timezone}`)])
    ));
}

/**
 * Sets the guide keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboar} Guide keyboard.
 */
const guideKeyboard = id => {
    const keyboard = Extra.markdown().markup(m => m.inlineKeyboard([
        m.callbackButton('<', `menu/${id}`),
        m.callbackButton('About', `about/${id}`)
    ]));

    keyboard.disable_web_page_preview = true;

    return keyboard;
}

/**
 * Sets the countdown keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboard} Countdown keyboard.
 */
const countdownKeyboard = id => {
    const keyboard = Extra.markdown().markup(m => m.inlineKeyboard([
        m.callbackButton('<', `menu/${id}`)
    ]));

    keyboard.disable_web_page_preview = true;

    return keyboard;
}

/**
 * Sets the about keyboard.
 * @param {Number} id - User id.
 * @returns {Keyboard} Message keyboard.
 */
const aboutKeyboard = id => {
    const keyboard = Extra.markdown().markup(m => m.inlineKeyboard([
        m.callbackButton('<', `guide/${id}`)
    ]));

    keyboard.disable_web_page_preview = true;

    return keyboard;
}

/**
 * In watchlist this is the keyboard to attached when user requires more info.
 * @param {String} type - wich list is invoking.
 * @param {Number} id - User's id.
 * @param {Object[JSON]} content - Content data.
 * @returns Keyboard to be attached to message.
 */
const moreKeyboard = (type, id, content) => {
    let keyboard = [];

    if(0 < content.length) {
        content.forEach(one => {
            keyboard.push([Markup.callbackButton(`${one.title_english}`, `more/${one.id}/${type}`)]);
        });

        keyboard = Extra.markdown().markup(m => m.inlineKeyboard(keyboard));
    }

    // Case user selected an empty tab.
    else
        keyboard = undefined;

    return keyboard;
}

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
    return Extra.markdown().markup((m) =>
        m.inlineKeyboard([
            m.callbackButton('Description', `search/${id}/character/description`)
        ])
    );
}

/**
 * This function allow the buttons search for the given id staff.
 * @param {string} id - Staff id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const staffKeyboard = id => {
    return Extra.markdown().markup((m) =>
        m.inlineKeyboard([
            m.callbackButton('Description', `search/${id}/staff/description`)
        ])
    );
}


/***********************************************************************************************************************
 ******************************************** SEARCH KEYBOARD FUNCTIONS ************************************************
 **********************************************************************************************************************/

/**
 * This function allow the buttons search for the given id manga.
 * @param {string} id - Manga id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const mangaKeyboardSearch = id => {
    return Extra.markdown().markup((m) =>
        m.inlineKeyboard([
            m.callbackButton('Description', `search/${id}/manga/description`),
            m.callbackButton('Genres', `search/${id}/manga/genres`),
            m.callbackButton('Users', `search/${id}/manga/users`),
            m.callbackButton('Readlist', `subscribe/${id}/manga`)
        ])
    );
}

/**
 * This function allow the buttons search for the given id anime.
 * @param {string} id - Anime id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const animeKeyboardSearch = id => {
    return Extra.markdown().markup((m) =>
        m.inlineKeyboard([
            m.callbackButton('Description', `search/${id}/anime/description`),
            m.callbackButton('Genres', `search/${id}/anime/genres`),
            m.callbackButton('Users', `search/${id}/anime/users`),
            m.callbackButton('Watchlist', `subscribe/${id}/anime`)
        ])
    );
}

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

    switch(button) {
        case 'all':
            keyboard = Extra.markdown().markup((m) =>
                m.inlineKeyboard([
                    m.callbackButton('Notify', `notify/${id}/all`),
                    m.callbackButton('Info', `info/${id}/anime/info`),
                    m.callbackButton('About', `info/${id}/anime/about`),
                    m.callbackButton('Remove', `unsubscribe/${id}/anime`)
                ])
            );
            break;
        case 'info':
            keyboard = Extra.markdown().markup((m) =>
                m.inlineKeyboard([
                    m.callbackButton('Notify', `notify/${id}/info`),
                    m.callbackButton('All', `info/${id}/anime/all`),
                    m.callbackButton('About', `info/${id}/anime/about`),
                    m.callbackButton('Remove', `unsubscribe/${id}/anime`)
                ])
            );
            break;
        case 'about':
            keyboard = Extra.markdown().markup((m) =>
                m.inlineKeyboard([
                    m.callbackButton('Notify', `notify/${id}/about`),
                    m.callbackButton('All', `info/${id}/anime/all`),
                    m.callbackButton('Info', `info/${id}/anime/info`),
                    m.callbackButton('Remove', `unsubscribe/${id}/anime`)
                ])
            );
            break;

    }

    return keyboard;
}

/**
 * This function allow the buttons search for the given id manga.
 * @param {string} id - Manga id.
 * @param {string} button - Wich button was pressed.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const mangaKeyboardReadlist = (id, button) => {
    let keyboard;

    switch(button) {
        case 'all':
            keyboard = Extra.markdown().markup((m) =>
                m.inlineKeyboard([
                    m.callbackButton('Info', `info/${id}/manga/info`),
                    m.callbackButton('About', `info/${id}/manga/about`),
                    m.callbackButton('Remove', `unsubscribe/${id}/manga`)
                ])
            );
            break;
        case 'info':
            keyboard = Extra.markdown().markup((m) =>
                m.inlineKeyboard([
                    m.callbackButton('All', `info/${id}/manga/all`),
                    m.callbackButton('About', `info/${id}/manga/about`),
                    m.callbackButton('Remove', `unsubscribe/${id}/manga`)
                ])
            );
            break;
        case 'about':
            keyboard = Extra.markdown().markup((m) =>
                m.inlineKeyboard([
                    m.callbackButton('All', `info/${id}/manga/all`),
                    m.callbackButton('Info', `info/${id}/manga/info`),
                    m.callbackButton('Remove', `unsubscribe/${id}/manga`)
                ])
            );
            break;
    }

    return keyboard;
}

/**
 * This function allow the buttons search for the given id anime.
 * @param {string} button - button it's calling.
 * @param {string} id - User id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const watchlistKeyboard = (button, id) => {
    let keyboard;

    switch(button) {
        case 'all':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('Airing', `watchlist/${id}/airing`),
                    m.callbackButton('Soon', `watchlist/${id}/soon`),
                    m.callbackButton('Completed', `watchlist/${id}/completed`),
                    m.callbackButton('Cancelled', `watchlist/${id}/cancelled`)
                ])
            );
            break;
        case 'airing':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('All', `watchlist/${id}/all`),
                    m.callbackButton('Soon', `watchlist/${id}/soon`),
                    m.callbackButton('Completed', `watchlist/${id}/completed`),
                    m.callbackButton('Cancelled', `watchlist/${id}/cancelled`)
                ])
            );
            break;
        case 'soon':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('All', `watchlist/${id}/all`),
                    m.callbackButton('Airing', `watchlist/${id}/airing`),
                    m.callbackButton('Completed', `watchlist/${id}/completed`),
                    m.callbackButton('Cancelled', `watchlist/${id}/cancelled`)
                ])
            );
            break;
        case 'completed':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('All', `watchlist/${id}/all`),
                    m.callbackButton('Airing', `watchlist/${id}/airing`),
                    m.callbackButton('Soon', `watchlist/${id}/soon`),
                    m.callbackButton('Cancelled', `watchlist/${id}/cancelled`)
                ])
            );
            break;
        case 'cancelled':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('All', `watchlist/${id}/all`),
                    m.callbackButton('Airing', `watchlist/${id}/airing`),
                    m.callbackButton('Soon', `watchlist/${id}/soon`),
                    m.callbackButton('Completed', `watchlist/${id}/completed`)
                ])
            );
            break;
    }

    keyboard.reply_markup.inline_keyboard.push([Markup.callbackButton('More info', `watchlist/${id}/more/${button}`)]);
    keyboard.disable_web_page_preview = true;

    return keyboard;
}

/**
 * This function allow the buttons search for the given id anime.
 * @param {string} button - button it's calling.
 * @param {string} id - User id.
 * @returns {buttons} Array of buttons to be linked in the message.
 */
const readlistKeyboard = (button, id) => {
    let keyboard;

    switch(button) {
        case 'all':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('Publishing', `readlist/${id}/publishing`),
                    m.callbackButton('Soon', `readlist/${id}/soon`),
                    m.callbackButton('Completed', `readlist/${id}/completed`),
                    m.callbackButton('Cancelled', `readlist/${id}/cancelled`)
                ])
            );
            break;
        case 'publishing':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('All', `readlist/${id}/all`),
                    m.callbackButton('Soon', `readlist/${id}/soon`),
                    m.callbackButton('Completed', `readlist/${id}/completed`),
                    m.callbackButton('Cancelled', `readlist/${id}/cancelled`)
                ])
            );
            break;
        case 'soon':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('All', `readlist/${id}/all`),
                    m.callbackButton('Publishing', `readlist/${id}/publishing`),
                    m.callbackButton('Completed', `readlist/${id}/completed`),
                    m.callbackButton('Cancelled', `readlist/${id}/cancelled`)
                ])
            );
            break;
        case 'completed':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('All', `readlist/${id}/all`),
                    m.callbackButton('Publishing', `readlist/${id}/publishing`),
                    m.callbackButton('Soon', `readlist/${id}/soon`),
                    m.callbackButton('Cancelled', `readlist/${id}/cancelled`)
                ])
            );
            break;
        case 'cancelled':
            keyboard = Extra.markdown().markup((m) => m.inlineKeyboard([
                    m.callbackButton('<', `menu/${id}`),
                    m.callbackButton('All', `readlist/${id}/all`),
                    m.callbackButton('Publishing', `readlist/${id}/publishing`),
                    m.callbackButton('Soon', `readlist/${id}/soon`),
                    m.callbackButton('Completed', `readlist/${id}/completed`)
                ])
            );
            break;
    }

    keyboard.reply_markup.inline_keyboard.push([Markup.callbackButton('More info', `readlist/${id}/more/${button}`)]);
    keyboard.disable_web_page_preview = true;

    return keyboard;
}

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    startKeyboard,
    menuKeyboard,
    userKeyboard,
    periodKeyboard,
    timeKeyboard,
    locationKeyboard,
    citiesKeyboard,
    updateTimeKeyboard,
    guideKeyboard,
    countdownKeyboard,
    moreAnimeKeyboard,
    moreMangaKeyboard,
    aboutKeyboard,
    mangaKeyboardSearch,
    animeKeyboardSearch,
    characterKeyboard,
    staffKeyboard,
    watchlistKeyboard,
    readlistKeyboard,
    animeKeyboardWatchlist,
    mangaKeyboardReadlist
}
