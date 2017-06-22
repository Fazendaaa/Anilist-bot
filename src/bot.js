'use strict';

import timezone from 'node-google-timezone';

import moment from 'moment-timezone';

import cityTimezones from 'city-timezones';

import {
    telegram,
    menu,
    serverError,
    aboutBot,
    line,
    indexMessage,
    removeCmd,
    watchMessage,
    cmdMessage,
    help,
    romanize
} from './utils';

import {
    menuKeyboard,
    startKeyboard,
    userKeyboard,
    timeKeyboard,
    locationKeyboard,
    citiesKeyboard,
    updateTimeKeyboard,
    countdownKeyboard,
    moreAnimeKeyboard,
    moreMangaKeyboard,
    aboutKeyboard,
    guideKeyboard,
    mangaKeyboardSearch,
    animeKeyboardSearch,
    animeKeyboardNotify,
    characterKeyboard,
    staffKeyboard,
    watchlistKeyboard,
    readlistKeyboard,
    mangaKeyboardReadlist,
    animeKeyboardWatchlist
} from './keyboard';

import {
    replyCallback,
    replyUsers,
    replyStatus,
    replyAnime,
    replyManga,
    replyAnimeInfo,
    replyMangaInfo,
    replyMangaReadlist,
    replyAnimeWatchlist,
    replyCharacter,
    replyStaff,
    replyStudio,
    replyList,
    replyAnimeNotify,
    replyNotify,
    replyNotifyInTime,
    replyInline,
    replyAboutAnime,
    replyAboutManga,
    replyCountdown
} from './reply';

import {
    verifyData,
    verifyString,
    verifyObject,
    verifyNumbers
} from './verify';

import {
    animePage,
    mangaPage,
    animeID,
    mangaID,
    getID,
} from './search';

/***********************************************************************************************************************
 ********************************************** NOTIFY FUNCTIONS *******************************************************
 **********************************************************************************************************************/

/**
 * This function query all users that added given anime to watchlist then make a layout update of it.
 * @param {Number} anime - Anime id.
 * @param {Object[JSON]} chats - Chats ids and its notifications status.
 * @returns Nothing, just sent the user a message.
 */
const notifyRelease = (anime, chats) => {
    animePage(anime).then(data => {
        const reply = replyNotify(data);
        chats.forEach(chat => telegram.sendMessage(chat, reply.message, reply.keyboard));
    }).catch(error => {
        console.log('[Error] notifyRelease', error);
        return error;
    });
}

/**
 * This function query all content that was released and notifies user about it.
 * @param {Number} User - User's id.
 * @param {Object[Number]} content - Content ids.
 * @returns Nothing, just sent the user a message.
 */
const notifyUserReleases = (user, content) => {
    Promise.all(content.map(anime => {
        return animeID(anime).then(data => {
            return replyNotifyInTime(data);
        });
    })).then(content => {
        return content.join('\n');
    }).then(notification => {
        telegram.sendMessage(user, `${line} DAILY RELEASES ${line}\n`.concat(notification), {parse_mode: 'Markdown'});
    }).catch(error => {
        console.log('[Error] notifyRelease', error);
        return error;
    });
}

/***********************************************************************************************************************
 ********************************************* TIMEZONE FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * Change user time for notifications.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's id.
 * @param {String} timzeone - User's timezone.
 * @returns {Void} Just send the message.
 */
const notificationTime = (db, user, timezone) => {
    if(timezone)
        telegram.sendMessage(user, 'In what hour of the day you want to be notified about episodes releases',
        timeKeyboard(user, timezone));
    // Case user already save his timezone, just want to update time for notifications.
    else
        db.getUserTime(user).then(response => {
            if(response)
                telegram.sendMessage(user, 'In what hour of the day you want to be notified about episodes releases',
                // Why convert it to moment if time is alreay a Date? Because is less info to be sent it.
                timeKeyboard(user, moment(response.time).tz(moment.tz.guess(response.timezone)).format()));
            else
                telegram.sendMessage(chat, 'Some error occured, please inform @Farmy about that.', undefined);
        }).catch(error => {
            console.log('[Error] notificationTime', error);
            return error;
        });
}

/**
 * Change set's the user timezone.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's id.
 * @param {String} city - User's city.
 * @returns {Void} Just send the message.
 */
const setTimezone = (db, user, city) => {
    // Doesn't work with no capitalize strings.
    const results = cityTimezones.lookupViaCity(city.replace(/\b\w/g, l => l.toUpperCase()));

    if(0 < results.length) {
        if(1 == results.length)
            notificationTime(db, user, moment(Date.now()).tz(results[0].timezone).format());
        else
            telegram.sendMessage(user, `I have found more than one city for, *${city}*. From wich province is yours?`,
            citiesKeyboard(user, results));
    }

    else
        telegram.sendMessage(user, 'City not found, please try it again.', locationKeyboard(user));
}

/**
 * Change user time for notifications.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's id.
 * @param {String} latitude - User's latitude location.
 * @param {String} longitude - User's longitude location.
 * @returns {JSON} Message to be printed plus keyboard to be attached to.
 */
const changeTime = (db, user, {latitude, longitude}) => {
    timezone.data(latitude, longitude, Date.now()/1000, (error, tz) => {
        if(!error && 'OK' == tz.raw_response.status) {
            let timezone;

            // In case that user is in a diferent timezone then the server.
            if(tz.raw_response.timeZoneId != moment.tz.guess())
                timezone = moment(tz.local_timestamp*1000).tz(moment.tz.guess()).format();
            // Since user, in this case, is in the same timezone as the server no need to convert anything.
            else
                timezone = moment().format();

            notificationTime(db, user, timezone);
        }
        else
            telegram.sendMessage(user, 'Function not available at the moment.');
    });
}

/***********************************************************************************************************************
 *********************************************** FILTER FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * This function compares wheter or not a status is the same as anime.
 * @param {Number} anime - Anime ID.
 * @param {String} button - Anime Status.
 * @returns {Boolean} If the status is the sames as anime.
 */
const filterAnimeByStatus = (anime, button) => {
    let status;

    switch(button) {
        case 'airing':
            status = 'currently airing';
            break;
        case 'completed':
            status = 'finished airing';
            break;
        case 'soon':
            status = 'not yet aired';
            break;
        default:
            status = button;
    }

    if('all' != status)
        return animeID(anime).then(data => {
            return (data.airing_status == status) ? data : undefined;
        }).catch(error => {
            console.log('[Error] filterAnimeByStatus:', error);
            return {
                error: '*Wachlist not found*',
                parse_mode: 'Markdown'
            };
        });
    else
        return animeID(anime);
}

/**
 * This function compares wheter or not a status is the same as manga.
 * @param {Number} manga - Manga ID.
 * @param {String} button - Manga Status.
 * @returns {Boolean} If the status is the sames as manga.
 */
const filterMangaByStatus = (manga, button) => {
    let status;

    switch(button) {
        case 'completed':
            status = 'finished publishing';
            break;
        case 'soon':
            status = 'not yet published';
            break;
        default:
            status = button;
    }

    if('all' != status)
        return mangaID(manga).then(data => {
            return (data.publishing_status == status) ? data : undefined;
        }).catch(error => {
            console.log('[Error] filterMangaByStatus:', error);
            return {
                error: '*Wachlist not found*',
                parse_mode: 'Markdown'
            };
        });
    else
        return mangaID(manga);
}

/**
 * This function compares wheter or not a status is the same as anime.
 * @param {Number} anime_id - Anime ID.
 * @param {String} button - Anime Status.
 * @returns {Boolean} If the status is the sames as anime.
 */
const filterAnimeByPage = (anime_id, button) => {
    let status;

    switch(button) {
        case 'airing':
            status = 'currently airing';
            break;
        case 'completed':
            status = 'finished airing';
            break;
        default:
            status = button;
    }

    if('all' != status)
        return animePage(anime_id).then(data => {
            return (data.airing_status == status) ? data : undefined;
        }).catch(error => {
            console.log('[Error] filterAnimeByPage:', error);
            return {
                error: '*Anime not found*',
                parse_mode: 'Markdown'
            };
        });
    else
        return animePage(anime_id);
}

/**
 * This function compares wheter or not a status is the same as manga.
 * @param {Number} manga_id - Manga ID.
 * @param {String} button - Manga Status.
 * @returns {Boolean} If the status is the sames as manga.
 */
const filterMangaByPage = (manga_id, button) => {
    let status;

    switch(button) {
        case 'airing':
            status = 'currently publishing';
            break;
        case 'completed':
            status = 'finished publishing';
            break;
        default:
            status = button;
    }

    if('all' != status)
        return mangaPage(manga_id).then(data => {
            return (data.publishing_status == status) ? data : undefined;
        }).catch(error => {
            console.log('[Error] filterMangaByPage:', error);
            return {
                error: '*Manga not found*',
                parse_mode: 'Markdown'
            };
        });
    else
        return mangaPage(manga_id);
}

/***********************************************************************************************************************
 *********************************************** LAYOUT FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * This function sets all content to Telegram layout.
 * @param {JSON} array - Data text.
 * @param {String} button - Keyboard that's calling it.
 * @param {Number} user - User id.
 * @returns {Objetct[String]} List layout.
 */
const listLayout = (array, button, user) => {
    return Promise.all(array.map(data => replyList(data)))
    .then(data => {
        const content = (0 < data.length) ? data : 'Empty';

        return [`${line} ${button.toUpperCase()} ${line}`].concat(content).join('\n');
    }).catch(error => {
        console.log('[Error] listLayout Promise:', error);
        return {
            error: '*list not found*',
            parse_mode: 'Markdown'
        };
    });
}

/**
 * This function sets all anime content to Telegram layout.
 * @param {JSON} array - Data text.
 * @param {String} button - Keyboard that's calling it.
 * @param {Number} user - User id.
 * @returns {Objetct[String]} Watchlist layout.
 */
const watchlistLayout = (array, button, user) => listLayout(array, button, user);

/**
 * This function sets all manga content to Telegram layout.
 * @param {JSON} array - Data text.
 * @param {String} button - Keyboard that's calling it.
 * @param {Number} user - User id.
 * @returns {Objetct[String]} Readlist layout.
 */
const readlistLayout = (array, button, user) => listLayout(array, button, user);

/**
 * This function filter and then display the layout of options of content to user see more about it.
 * @param {Number} user - User's ID.
 * @param {String} type - Type of content.
 * @param {String} button - Wich button was pressed.
 * @param {Object[JSON]} data - Content.
 * @param {Function} filterFunc - Filter content function.
 * @param {Function} keyboardFunc - Keyboard attached function.
 * @returns {JSON} message and keyboard attached to it.
 */
const listContentLayout = (user, type, button, data, {filterFunc, keyboardFunc}) => new Promise((resolve, reject) => {
    if(data)
        Promise.all(data.map(element => filterFunc(element.content, button)))
        .then(response => response.filter(element => element))
        .then(response => {
            const message = (0 < response.length) ?
                            `Select wich ${type} you want more info about it: ` : 'No content available';
            resolve({
                message,
                keyboard: keyboardFunc(user, response)
            });
        });
    else
        resolve({
            message: `*Empty ${button} tab*\nPlease, try adding some content to it.`,
            keyboard: {parse_mode: 'Markdown'}
        });
});

/**
 * This function returns all user's animes that are in his readlist to show more info about it.
 * @param {Number} user - User's ID.
 * @param {String} button - Wich button was pressed.
 * @param {Object[JSON]} data - Animes content.
 * @returns {JSON} message and keyboard attached to it.
 */
const watchlistContentLayout = (user, button, data) => listContentLayout(user, 'anime', button, data,
                                                {filterFunc: filterAnimeByStatus, keyboardFunc: moreAnimeKeyboard});

/**
 * This function returns all user's mangas that are in his readlist to show more info about it.
 * @param {Number} user - User's ID.
 * @param {String} button - Wich button was pressed.
 * @param {Object[JSON]} data - Mangas content.
 * @returns {JSON} message and keyboard attached to it.
 */
const readlistContentLayout = (user, button, data) => listContentLayout(user, 'manga', button, data,
                                                {filterFunc: filterMangaByStatus, keyboardFunc: moreMangaKeyboard});

/***********************************************************************************************************************
 ************************************************ FETCH FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * This function gather all content in user database and returns it in Telegram layout.
 * @param {JSON} data - Content data.
 * @param {String} button - Button that triggered this call.
 * @param {Number} user - User id.
 * @param {String} kind - Kind of list: Watch or Read.
 * @param {Function} keyboardFunc - Function to attach keyboard to response.
 * @param {Function} filterFunc - Given tab, filters it the content.
 * @param {Function} layoutFunc - Sets the layout.
 * @returns {JSON} List layout.
 */
const fetchList = (data, button, user, kind, keyboardFunc, filterFunc, layoutFunc) => new Promise((resolve, reject) => {
    data.then(response => {
        if(response)
            return Promise.all(response.map(element => filterFunc(element.content, button)));
        // In case the list is empty
        else
            resolve({
                message: `${line} ${kind} ${line}\n${line} ${button.toUpperCase()} ${line}\nEmpty list`,
                keyboard: keyboardFunc(button, user)
            });
    })
    /*  Filter any undefined value*/
    .then(data => data.filter(element => element))
    .then(array => {
        layoutFunc(array, button, user).then(data => {
            resolve({
                message: data,
                keyboard:keyboardFunc(button, user)
            });
        });
    }).catch(error => reject({
        message: error,
        keyboard: keyboardFunc(button, user)
    }));
});

/**
 * Gather the user watchlist menu.
 * @param {DB} db - Bot database.
 * @param {String} button - Wich button user selected.
 * @param {Number} user - User id.
 * @returns {JSON} Watchlist layout.
 */
const fetchWatchlist = (db, button, user) => new Promise((resolve, reject) => {
    switch(button) {
        case 'all':
        case 'airing':
        case 'soon':
        case 'completed':
        case 'cancelled':
            fetchList(db.fetchAnimes(user), button, user, 'WATCHLIST', watchlistKeyboard, filterAnimeByStatus,
            watchlistLayout).then(resolve).catch(error => {
                reject({
                    message: error,
                    keyboard: keybardFunc(button, user)
                });
            });
            break;
        default:
            reject({
                message: 'wrong button',
                keyboard: undefined
            });
            break;
    }
});

/**
 * Gather the user watchlist menu.
 * @param {DB} db - Bot database.
 * @param {String} button - Wich button user selected.
 * @param {Number} user - User id.
 * @returns {JSON} Readlist layout.
 */
const fetchReadlist = (db, button, user) => new Promise((resolve, reject) => {
    switch(button) {
        case 'all':
        case 'publishing':
        case 'soon':
        case 'completed':
        case 'cancelled':
            fetchList(db.fetchMangas(user), button, user, 'READLIST', readlistKeyboard, filterMangaByStatus,
            readlistLayout).then(resolve).catch(error => {
                reject({
                    message: error,
                    keyboard: keybardFunc(button, user)
                });
            });
            break;
        default:
            resolve({
                message: 'wrong button',
                keyboard: undefined
            });
            break;
    }
});

/***********************************************************************************************************************
 ************************************************* INFO FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * Reply content about needed info.
 * @param {Number} user - Users id.
 * @param {String} kind - Anime, Staff or Character.
 * @param {Number} id - Content id.
 * @param {String} button - Wich button was pressed.
 * @returns {String} Data about wanted info.
 */
const searchContentInfo = (user, kind, id, button) => new Promise((resolve, reject) => {
    getID(kind, id).then(data => {
        switch(button) {
            case 'description':
                const search = ('staff' == kind || 'character' == kind) ? data.info : data.description;
                const description = verifyString(search);
                resolve((196 < description.length) ? replyCallback(description.substring(0, 196)) : description);
                break;
            case 'genres':
                resolve(verifyObject(data.genres));
                break;
            case 'users':
                resolve(replyUsers(data.list_stats));
                break;
        }
    }).catch((error) => {
        console.log('[Error] searchContentInfo:', error);
        resolve("An error has occured, please tell me what happened: @Farmy");
    });
});

/**
 * This function edits the content in message layout in list.
 * @param {Number} id - Content ID.
 * @param {Boolena} notify - Wheter or not notify user about new realeases;
 * @param {String} button - Wich button triggered the call.
 * @param {Function} pageFunc - Function to page info about content.
 * @param {Function} replyFunc - Function to set message layout in all tab.
 * @param {Function} replyContentFunc - Function to set message layout in info tab.
 * @param {Function} aboutFunc - Function to set message layout in about tab.
 * @param {Function} keyboardFunc - Function to attach keyboard in the message.
 * @returns {JSON} New message to be seted.
 */
const editContent = (id, notify, button, {pageFunc, replyContentFunc, replyFunc, keyboardFunc, aboutFunc}) => new Promise((resolve, reject) => {
    pageFunc(id).then(content => {
        switch(button) {
            case 'info':
                return {
                    message: replyContentFunc({content, notify}),
                    keyboard: keyboardFunc(id, 'info')
                };
            case 'all':
                return {
                    // Even though manga for now won't use notify this arg must be passed through so when it's available only
                    // replyFunc should be altered
                    message: replyFunc({content, notify}),
                    keyboard: keyboardFunc(id, 'all')
                };
            case 'about':
                return {
                    message: aboutFunc({content, notify}),
                    keyboard: keyboardFunc(id, 'about')
                };
            default:
                return {
                    message: '*Invalid button*',
                    keyboard: undefined
                };
        }
    }).then(resolve).catch(error => {
        console.log('[Error] editContent:', error);
        reject({
            message: error,
            keyboard: undefined
        });
    });
});

/**
 * This function edit anime content in Watchlist to show more info about it.
 * @param {Number} id - Anime ID
 * @param {String} button - What button was pressed
 * @returns {JSON} New content message to be edited.
 */
const editContentInfo = (db, user_id, content_id, kind, button) => new Promise((resolve, reject) => {
    let info, functions;

    switch(kind) {
        case 'anime':
            info = db.fetchAnime(user_id, content_id);
            functions = {
                pageFunc: animePage,
                replyContentFunc: replyAnimeInfo,
                replyFunc: replyAnimeWatchlist,
                keyboardFunc: animeKeyboardWatchlist,
                aboutFunc: replyAboutAnime
            }
            break;
        case 'manga':
            info = db.fetchManga(user_id, content_id);
            functions = {
                pageFunc: mangaPage,
                replyContentFunc: replyMangaInfo,
                replyFunc: replyMangaReadlist,
                keyboardFunc: mangaKeyboardReadlist,
                aboutFunc: replyAboutManga
            }
            break;
    }

    info.then(data => editContent(data.content, data.notify, button, functions)).then(resolve).catch(error => {
        console.log('[Error] editContentInfo:', error);
        reject({
            message: "An error has occured, please tell me what happened: @Farmy",
            keyboard: undefined
        });
    });
});

/**
 * Returns user info.
 * @param {DB} db - Bot's database.
 * @param {Number} id - User's ID.
 * @returns {JSON} New content message to be edited.
 */
const userInfo = (db, id) => {
    return db.fetchUser(id).then(data => {
        const notify = (data.notify) ? 'Enabled' : 'Disabled';
        const time = (data.time) ? moment(data.time).format('LT') : 'None';

        return {
            message: `${line} User ${line}\nNotify: ${notify}\nTime for notifications: ${time}\n`,
            keyboard: userKeyboard(id)
        };
    })
}

/***********************************************************************************************************************
 ************************************************* LIST FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * Given list. Watch or Read, and fetched data sets all of this to Telegram standars.
 * @param {Object[JSON]} fetch - Anilist content data.
 * @param {Objetct[Number]} positions - Content postions in list that the user want more info about it.
 * @param {String} button - Kinda of button that triggered the action.
 * @param {Function} filterFunc - Given button, how to filter content.
 * @param {Function} replyFunc - Layout function.
 * @param {Function} keyboardFunc - Attached keyboard.
 * @returns {Objetc[JSON]} Telegram content to be printed.
 */
const getList = (fetch, positions, button, filterFunc, replyFunc, keyboardFunc) => new Promise((resolve, reject) => {
    Promise.all(fetch.map(element => {
        return Promise.resolve(filterFunc(element.content, button).then(filtred => {
            return {
                notify: element.notify,
                content: filtred
            };
        }));
    })).then(value => {return value.filter(element => element.content);})
    .then(data => {
        return Promise.all(positions.map(pos => {
            if(0 <= pos && pos <= data.length)
                return data[pos];
            else
                undefined;
        }));
    }).then(value => {return value.filter(element => element);})
    .then(indexes => {
        if(0 < indexes.length)
            return Promise.all(indexes.map(element => {
                return {
                    message: replyFunc(element),
                    keyboard: keyboardFunc(element.content.id, 'all')
                };
            })).catch(error => {throw error;});
        else
            return ([{
                message: '*Invalid index*',
                keyboard: {parse_mode: 'Markdown'}
            }]);
    }).then(data => resolve(data))
    .catch(error => {
        console.log('[Error] list:', error);
        return [{
            error: '*Content not found*',
            keyboard: {parse_mode: 'Markdown'}
        }];
    });
});

/**
 * This function fetch info about each anime in watchlist.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's ID.
 * @param {String} button - Wich button was pressed.
 * @param {Object[Number]} positions - Indexes of content.
 * @returns {Objetc[JSON]} Telegram content to be printed.
 */
const watchlist = (db, user, button, positions) => new Promise((resolve, reject) => {
    db.fetchAnimes(user).then(content => {
        if(content)
            return content;
        else
            resolve({
                error: '*Empty tab*',
                parse_mode: 'Markdown'
            });
    }).then(fetch => getList(fetch, positions, button, filterAnimeByPage, replyAnimeWatchlist, animeKeyboardWatchlist))
    .then(resolve);
});

/**
 * This function fetch info about each manga in readlist.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's ID.
 * @param {String} button - Wich button was pressed.
 * @param {Object[Number]} positions - Indexes of content.
 * @returns {Objetc[JSON]} Telegram content to be printed.
 */
const readlist = (db, user, button, positions) => new Promise((resolve, reject) => {
    return db.fetchMangas(user).then(content => {
        if(content)
            return content;
        else
            resolve({
                error: '*Empty tab*',
                parse_mode: 'Markdown'
            });
    }).then(fetch => getList(fetch, positions, button, filterMangaByPage, replyMangaReadlist, mangaKeyboardReadlist))
    .then(resolve);
});

/***********************************************************************************************************************
 ************************************************* MORE FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * This function returns animes from user's watchlist in buttons to be selected.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's ID.
 * @param {String} button - Wich button was pressed.
 * @returns {JSON} Message and keyboard to be atteched.
*/
const watchlistMore = (db, user, button) => new Promise((resolve, reject) => {
    db.fetchAnimes(user).then(content => {
        if(content)
            return content;
        else
            resolve({
                message: `*Empty ${button} tab*\nPlease, try adding some content to it.`,
                keyboard: {parse_mode: 'Markdown'}
            });
    }).then(fetch => {
        watchlistContentLayout(user, button, fetch).then(resolve);
    }).catch(error => {
        console.log('[Error] watchlistMore', error);
        resolve({
            message: `*Server error*\nPlease, inform @Farmy about it.`,
            keyboard: {parse_mode: 'Markdown'}
        });
    });
});

/**
 * This function returns mangas from user's readlist in buttons to be selected.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's ID.
 * @param {String} button - Wich button was pressed.
 * @returns {JSON} Message and keyboard to be atteched.
*/
const readlistMore = (db, user, button) => new Promise((resolve, reject) => {
    db.fetchMangas(user).then(content => {
        if(content)
            return content;
        else
            resolve({
                message: `*Empty ${button} tab*\nPlease, try adding some content to it.`,
                keyboard: {parse_mode: 'Markdown'}
            });
    }).then(fetch => {
        readlistContentLayout(user, button, fetch).then(resolve);
    }).catch(error => {
        console.log('[Error] readlistMore', error);
        resolve({
            message: `*Server error*\nPlease, inform @Farmy about it.`,
            keyboard: {parse_mode: 'Markdown'}
        });
    });
});

/**
 * This function returns specific manga from user's readlist.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's ID.
 * @param {Number} id - Content's ID.
 * @param {String} kind - Wich kind of content.
 * @returns {JSON} Message and keyboard to be atteched.
*/
const fetchMore = (db, user, id, kind) => new Promise((resolve, reject) => {
    switch(kind) {
        case 'anime':
            db.fetchAnime(user, id).then(response => {
                if(response)
                    animePage(response.content).then(anime => {
                        resolve({
                            message: replyAnimeWatchlist({content: anime, notify: response.notify}),
                            keyboard: animeKeyboardWatchlist(response.content, 'all')
                        });
                    });
                else
                    resolve({
                        message: 'Content not found',
                        keyboard: undefined
                    });
            })
            break;
        case 'manga':
            db.fetchManga(user, id).then(response => {
                if(response)
                    mangaPage(response.content).then(manga => {
                        resolve({
                            message: replyMangaReadlist({content: manga}),
                            keyboard: mangaKeyboardReadlist(response.content, 'all')
                        });
                    });
                else
                    resolve({
                        message: 'Content not found',
                        keyboard: undefined
                    });
            })
            break;
    }
});

/***********************************************************************************************************************
 ************************************************ COMMON FUNCTIONS *****************************************************
 **********************************************************************************************************************/

/**
 * This function seeks all airing animes from user list and shows the order of it's episode releases.
 * @param {Object[Number]} animes - Anislist Animes ID.
 * @returns {Object[JSON]} Layout to be printed.
 */
const showCountdown = animes => new Promise((resolve, reject) => {
    Promise.all(animes.map(element => {
        return animePage(element.content).then(response => {
            if(response.airing)
                return {response, notify: element.notify};
            else
                return undefined;
        });
    }))
    // Remove all undefined values -- all not airing animes.
    .then(data => data.filter(element => element))
    // Sorts all releasing animes
    .then(data => data.sort((key_1, key_2) => {
        return key_1.response.airing.countdown - key_2.response.airing.countdown;
    }))
    .then(data => {
        return data.map((element, index) => {
            return `${line} ${romanize(index+1)} ${line}\n`.concat(replyCountdown(element.response, element.notify));
        })
    }).then(data => `${line} COUNTDOWN ${line}\n`.concat(data.join('\n')))
    .then(resolve).catch(reject);
});

/**
 * This function answer the response for data in buttons.
 * @param {DB} db - Users database.
 * @param {Number} message - Message id.
 * @param {Number} user - Users id.
 * @param {Number} chat - Chat id.
 * @param {string} args - info about data id, type and wich button was pressed.
 * @returns {string} Message to be printed.
 */
const buttons = (db, {message, user, chat, args}) => new Promise((resolve, reject) => {
    // type: content / kind: anime or character or staff or studio or watchlist tab /
    // id: content id / button: wich button was pressed
    const [type, id, kind, button] = args.split('/');
    const loadingScreen = {message: 'Loading...', visualization: false};

    switch(type) {
        case 'search':
            searchContentInfo(user, kind, id, button).then(data => {
                resolve({message: data, visualization: true});
            }).catch(error => console.log('[Error] buttons anime/staff/character:', error));
            break;
        case 'info':
            editContentInfo(db, user, id, kind, button).then(data => {
                telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
            }).catch(error => console.log('[Error] buttons info:', error));
            resolve(loadingScreen);
            break;
        case 'user':
            if(kind && 'notification' == kind)
                db.toggleNotifications(user).then(response => {
                    userInfo(db, user).then(data => {
                        telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
                    }).catch(error => console.log('[Error] buttons about:', error));
                });
            else
                userInfo(db, user).then(data => {
                    telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons about:', error));
            resolve(loadingScreen);
            break;
        case 'menu':
            telegram.editMessageText(chat, message, undefined, menu, menuKeyboard(user));
            resolve(loadingScreen);
            break;
        case 'watchlist':
            if('more' == kind)
                watchlistMore(db, user, button).then(data => {
                    telegram.sendMessage(user, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons watchlist more:', error));

            else
                fetchWatchlist(db, kind, user).then(data => {
                    telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons watchlist fetchWatchlist:', error));
            
            resolve(loadingScreen);
            break;
        case 'readlist':
            if('more' == kind)
                readlistMore(db, user, button).then(data => {
                    telegram.sendMessage(user, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons readlist more:', error));
            else
                fetchReadlist(db, kind, user).then(data => {
                    telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons readlist:', error));
            resolve(loadingScreen);
            break;
        case 'guide':
            telegram.editMessageText(chat, message, undefined, cmdMessage, guideKeyboard(user));
            resolve(loadingScreen);
            break;
        case 'about':
            telegram.editMessageText(chat, message, undefined, aboutBot, aboutKeyboard(user));
            resolve(loadingScreen);
            break;
        case 'subscribe':
            db.subscribe(user, id, kind).then(added => {
                if(added) {
                    let text;

                    switch(kind) {
                        case 'anime':
                            text = "Added to your Watchlist!\nIf you don't want to be notified upon new episodes, \
open chat with ANILISTbot and see the guide in Menu.";
                            break;
                        case 'manga':
                            text = 'Added to your Readlist!\nSee it in a chat with ANILISTbot, just press Menu.';
                            break;
                    }

                    resolve({message: text, visualization: true});
                }
                else
                    resolve({message: `This ${kind} is already in your list`, visualization: true});
            }).catch(error => console.log('[Error] buttons subscribe:', error));
            break;
        case 'unsubscribe':
            db.unsubscribe(user, id, kind).then(removed => {
                if(removed) {
                    switch(kind) {
                        case 'anime':
                            animeID(id).then(anime => {
                                telegram.editMessageText(chat, message, undefined, replyAnime(anime),
                                animeKeyboardSearch(id));
                                resolve({message: 'Removed from your watchlist', visualization: true});
                            }).catch(error => {throw error;});
                            break;
                        case 'manga':
                            mangaID(id).then(manga => {
                                telegram.editMessageText(chat, message, undefined, replyManga(manga),
                                mangaKeyboardSearch(id));
                                resolve({message: 'Removed from your readlist', visualization: true});
                            }).catch(error => {throw error;});
                            break;
                    }
                }
                else
                    resolve({message: `This ${kind} is not in your list`, visualization: true});
            }).catch(error => console.log('[Error] buttons unsubscribe:', error));
            break;
        case 'notify':
            db.toggleAnime(user, id).then(toggled => {
                db.fetchAnime(user, id).then(anime => {
                    return animePage(anime.content).then(content => {
                        return {
                            notify: anime.notify,
                            content
                        };
                    }).catch(error => {throw error;});
                }).then(anime => {
                    let layout;

                    switch(kind) {
                        case 'all':
                            layout = replyAnimeWatchlist(anime);
                            break;
                        case 'info':
                            layout = replyAnimeInfo(anime);
                            break;
                        case 'about':
                            layout = replyAboutAnime(anime);
                            break;
                    }

                    resolve({message: `Notification changed to: ${(anime.notify) ? 'Enabled' : 'Disabled' }`,
                    visualization: true});
                    telegram.editMessageText(chat, message, undefined, layout, animeKeyboardWatchlist(id, kind));
                }).catch(error => {throw error;});
            }).catch(error => console.log('[Error] buttons notify:', error));
            break;
        case 'countdown':
            db.fetchAnimes(user).then(animes => {
                showCountdown(animes).then(data => {
                    telegram.editMessageText(chat, message, undefined, data, countdownKeyboard(user));
                }).catch(error => {throw error;});
            }).catch(error => console.log('[Error] buttons countdown:', error));
            resolve(loadingScreen);
            break;
        case 'time':
            if('all' == kind)
                db.getUserTime(user).then(time => {
                    // User hasn't set any time for notifications yet.
                    if(!time)
                        telegram.sendMessage(chat, 'Send your location or search it for your timezone.',
                        locationKeyboard(user));
                    else
                        telegram.sendMessage(chat, 'I already have your timezone. Wanna change it or just update \
                        notification time?', updateTimeKeyboard(user));
                })
            else if('remove' == kind)
                db.removeTime(user).then(removed => {
                    if(removed)
                        telegram.sendMessage(chat, 'Removed time for notifications.', startKeyboard(user));
                    else
                        telegram.sendMessage(chat, 'Time for notifications already removed.', startKeyboard(user));
                }).catch(error => console.log('[Error] buttons time remove:', error));
            else {
                db.setTime(user, kind, button).then(response => {
                    if(response)
                        telegram.sendMessage(chat, 'Time for notifications setted.', startKeyboard(user));
                    else
                        telegram.sendMessage(chat, 'Some error occured, please inform @Farmy about that.', startKeyboard(user));
                }).catch(error => console.log('[Error] buttons time set:', error));
            }
            resolve(loadingScreen);
            break;
        case 'timezone':
            notificationTime(db, user, moment().tz(kind.concat(`/${button}`)).format());
            break;
        case 'more':
            fetchMore(db, user, id, kind).then(data => {
                telegram.sendMessage(chat, data.message, data.keyboard);
            }).catch(error => console.log('[Error] buttons fetchMore', error));
            resolve(loadingScreen);
            break;
        default:
            resolve({message: 'Button error', visualization: true});
    }
});

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    buttons,
    notifyRelease,
    notifyUserReleases,
    changeTime,
    setTimezone,
    notificationTime
}
