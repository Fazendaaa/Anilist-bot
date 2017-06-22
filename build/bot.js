'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _nodeGoogleTimezone = require('node-google-timezone');

var _nodeGoogleTimezone2 = _interopRequireDefault(_nodeGoogleTimezone);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _cityTimezones = require('city-timezones');

var _cityTimezones2 = _interopRequireDefault(_cityTimezones);

var _utils = require('./utils');

var _keyboard = require('./keyboard');

var _reply = require('./reply');

var _verify = require('./verify');

var _search = require('./search');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    (0, _search.animePage)(anime).then(data => {
        const reply = (0, _reply.replyNotify)(data);
        chats.forEach(chat => _utils.telegram.sendMessage(chat, reply.message, reply.keyboard));
    }).catch(error => {
        console.log('[Error] notifyRelease', error);
        return error;
    });
};

/**
 * This function query all content that was released and notifies user about it.
 * @param {Number} User - User's id.
 * @param {Object[Number]} content - Content ids.
 * @returns Nothing, just sent the user a message.
 */
const notifyUserReleases = (user, content) => {
    Promise.all(content.map(anime => {
        return (0, _search.animeID)(anime).then(data => {
            return (0, _reply.replyNotifyInTime)(data);
        });
    })).then(content => {
        return content.join('\n');
    }).then(notification => {
        _utils.telegram.sendMessage(user, `${_utils.line} DAILY RELEASES ${_utils.line}\n`.concat(notification), { parse_mode: 'Markdown' });
    }).catch(error => {
        console.log('[Error] notifyRelease', error);
        return error;
    });
};

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
    if (timezone) _utils.telegram.sendMessage(user, 'In what hour of the day you want to be notified about episodes releases', (0, _keyboard.timeKeyboard)(user, timezone));
    // Case user already save his timezone, just want to update time for notifications.
    else db.getUserTime(user).then(response => {
            if (response) _utils.telegram.sendMessage(user, 'In what hour of the day you want to be notified about episodes releases',
            // Why convert it to moment if time is alreay a Date? Because is less info to be sent it.
            (0, _keyboard.timeKeyboard)(user, (0, _momentTimezone2.default)(response.time).tz(_momentTimezone2.default.tz.guess(response.timezone)).format()));else _utils.telegram.sendMessage(chat, 'Some error occured, please inform @Farmy about that.', undefined);
        }).catch(error => {
            console.log('[Error] notificationTime', error);
            return error;
        });
};

/**
 * Change set's the user timezone.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's id.
 * @param {String} city - User's city.
 * @returns {Void} Just send the message.
 */
const setTimezone = (db, user, city) => {
    // Doesn't work with no capitalize strings.
    const results = _cityTimezones2.default.lookupViaCity(city.replace(/\b\w/g, l => l.toUpperCase()));

    if (0 < results.length) {
        if (1 == results.length) notificationTime(db, user, (0, _momentTimezone2.default)(Date.now()).tz(results[0].timezone).format());else _utils.telegram.sendMessage(user, `I have found more than one city for, *${city}*. From wich province is yours?`, (0, _keyboard.citiesKeyboard)(user, results));
    } else _utils.telegram.sendMessage(user, 'City not found, please try it again.', (0, _keyboard.locationKeyboard)(user));
};

/**
 * Change user time for notifications.
 * @param {DB} db - Bot's database.
 * @param {Number} user - User's id.
 * @param {String} latitude - User's latitude location.
 * @param {String} longitude - User's longitude location.
 * @returns {JSON} Message to be printed plus keyboard to be attached to.
 */
const changeTime = (db, user, _ref) => {
    let latitude = _ref.latitude,
        longitude = _ref.longitude;

    _nodeGoogleTimezone2.default.data(latitude, longitude, Date.now() / 1000, (error, tz) => {
        if (!error && 'OK' == tz.raw_response.status) {
            let timezone;

            // In case that user is in a diferent timezone then the server.
            if (tz.raw_response.timeZoneId != _momentTimezone2.default.tz.guess()) timezone = (0, _momentTimezone2.default)(tz.local_timestamp * 1000).tz(_momentTimezone2.default.tz.guess()).format();
            // Since user, in this case, is in the same timezone as the server no need to convert anything.
            else timezone = (0, _momentTimezone2.default)().format();

            notificationTime(db, user, timezone);
        } else _utils.telegram.sendMessage(user, 'Function not available at the moment.');
    });
};

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

    switch (button) {
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

    if ('all' != status) return (0, _search.animeID)(anime).then(data => {
        return data.airing_status == status ? data : undefined;
    }).catch(error => {
        console.log('[Error] filterAnimeByStatus:', error);
        return {
            error: '*Wachlist not found*',
            parse_mode: 'Markdown'
        };
    });else return (0, _search.animeID)(anime);
};

/**
 * This function compares wheter or not a status is the same as manga.
 * @param {Number} manga - Manga ID.
 * @param {String} button - Manga Status.
 * @returns {Boolean} If the status is the sames as manga.
 */
const filterMangaByStatus = (manga, button) => {
    let status;

    switch (button) {
        case 'completed':
            status = 'finished publishing';
            break;
        case 'soon':
            status = 'not yet published';
            break;
        default:
            status = button;
    }

    if ('all' != status) return (0, _search.mangaID)(manga).then(data => {
        return data.publishing_status == status ? data : undefined;
    }).catch(error => {
        console.log('[Error] filterMangaByStatus:', error);
        return {
            error: '*Wachlist not found*',
            parse_mode: 'Markdown'
        };
    });else return (0, _search.mangaID)(manga);
};

/**
 * This function compares wheter or not a status is the same as anime.
 * @param {Number} anime_id - Anime ID.
 * @param {String} button - Anime Status.
 * @returns {Boolean} If the status is the sames as anime.
 */
const filterAnimeByPage = (anime_id, button) => {
    let status;

    switch (button) {
        case 'airing':
            status = 'currently airing';
            break;
        case 'completed':
            status = 'finished airing';
            break;
        default:
            status = button;
    }

    if ('all' != status) return (0, _search.animePage)(anime_id).then(data => {
        return data.airing_status == status ? data : undefined;
    }).catch(error => {
        console.log('[Error] filterAnimeByPage:', error);
        return {
            error: '*Anime not found*',
            parse_mode: 'Markdown'
        };
    });else return (0, _search.animePage)(anime_id);
};

/**
 * This function compares wheter or not a status is the same as manga.
 * @param {Number} manga_id - Manga ID.
 * @param {String} button - Manga Status.
 * @returns {Boolean} If the status is the sames as manga.
 */
const filterMangaByPage = (manga_id, button) => {
    let status;

    switch (button) {
        case 'airing':
            status = 'currently publishing';
            break;
        case 'completed':
            status = 'finished publishing';
            break;
        default:
            status = button;
    }

    if ('all' != status) return (0, _search.mangaPage)(manga_id).then(data => {
        return data.publishing_status == status ? data : undefined;
    }).catch(error => {
        console.log('[Error] filterMangaByPage:', error);
        return {
            error: '*Manga not found*',
            parse_mode: 'Markdown'
        };
    });else return (0, _search.mangaPage)(manga_id);
};

/***********************************************************************************************************************
 *********************************************** LAYOUT FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * This function sets all content to Telegram layout.
 * @param {String} type - Content type.
 * @param {JSON} array - Data text.
 * @param {String} button - Keyboard that's calling it.
 * @param {Number} user - User id.
 * @returns {Objetct[String]} List layout.
 */
const listLayout = (type, array, button, user) => {
    return Promise.all(array.map(data => (0, _reply.replyList)(data, type))).then(data => {
        const content = 0 < data.length ? data : 'Empty';

        return [`${_utils.line} ${button.toUpperCase()} ${_utils.line}`].concat(content).join('\n');
    }).catch(error => {
        console.log('[Error] listLayout Promise:', error);
        return {
            error: '*list not found*',
            parse_mode: 'Markdown'
        };
    });
};

/**
 * This function sets all anime content to Telegram layout.
 * @param {JSON} array - Data text.
 * @param {String} button - Keyboard that's calling it.
 * @param {Number} user - User id.
 * @returns {Objetct[String]} Watchlist layout.
 */
const watchlistLayout = (array, button, user) => listLayout('anime', array, button, user);

/**
 * This function sets all manga content to Telegram layout.
 * @param {JSON} array - Data text.
 * @param {String} button - Keyboard that's calling it.
 * @param {Number} user - User id.
 * @returns {Objetct[String]} Readlist layout.
 */
const readlistLayout = (array, button, user) => listLayout('manga', array, button, user);

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
const listContentLayout = (user, type, button, data, _ref2) => {
    let filterFunc = _ref2.filterFunc,
        keyboardFunc = _ref2.keyboardFunc;
    return new Promise((resolve, reject) => {
        if (data) Promise.all(data.map(element => filterFunc(element.content, button))).then(response => response.filter(element => element)).then(response => {
            const message = 0 < response.length ? `Select wich ${type} you want more info about it: ` : 'No content available';
            resolve({
                message: message,
                keyboard: keyboardFunc(user, response)
            });
        });else resolve({
            message: `*Empty ${button} tab*\nPlease, try adding some content to it.`,
            keyboard: { parse_mode: 'Markdown' }
        });
    });
};

/**
 * This function returns all user's animes that are in his readlist to show more info about it.
 * @param {Number} user - User's ID.
 * @param {String} button - Wich button was pressed.
 * @param {Object[JSON]} data - Animes content.
 * @returns {JSON} message and keyboard attached to it.
 */
const watchlistContentLayout = (user, button, data) => listContentLayout(user, 'anime', button, data, { filterFunc: filterAnimeByStatus, keyboardFunc: _keyboard.moreAnimeKeyboard });

/**
 * This function returns all user's mangas that are in his readlist to show more info about it.
 * @param {Number} user - User's ID.
 * @param {String} button - Wich button was pressed.
 * @param {Object[JSON]} data - Mangas content.
 * @returns {JSON} message and keyboard attached to it.
 */
const readlistContentLayout = (user, button, data) => listContentLayout(user, 'manga', button, data, { filterFunc: filterMangaByStatus, keyboardFunc: _keyboard.moreMangaKeyboard });

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
        if (response) return Promise.all(response.map(element => filterFunc(element.content, button)));
        // In case the list is empty
        else resolve({
                message: `${_utils.line} ${kind} ${_utils.line}\n${_utils.line} ${button.toUpperCase()} ${_utils.line}\nEmpty list`,
                keyboard: keyboardFunc(button, user)
            });
    })
    /*  Filter any undefined value*/
    .then(data => data.filter(element => element)).then(array => {
        layoutFunc(array, button, user).then(data => {
            resolve({
                message: data,
                keyboard: keyboardFunc(button, user)
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
    switch (button) {
        case 'all':
        case 'airing':
        case 'soon':
        case 'completed':
        case 'cancelled':
            fetchList(db.fetchAnimes(user), button, user, 'WATCHLIST', _keyboard.watchlistKeyboard, filterAnimeByStatus, watchlistLayout).then(resolve).catch(error => {
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
    switch (button) {
        case 'all':
        case 'publishing':
        case 'soon':
        case 'completed':
        case 'cancelled':
            fetchList(db.fetchMangas(user), button, user, 'READLIST', _keyboard.readlistKeyboard, filterMangaByStatus, readlistLayout).then(resolve).catch(error => {
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
    (0, _search.getID)(kind, id).then(data => {
        switch (button) {
            case 'description':
                const search = 'staff' == kind || 'character' == kind ? data.info : data.description;
                const description = (0, _verify.verifyString)(search);
                resolve(196 < description.length ? (0, _reply.replyCallback)(description.substring(0, 196)) : description);
                break;
            case 'genres':
                resolve((0, _verify.verifyObject)(data.genres));
                break;
            case 'users':
                resolve((0, _reply.replyUsers)(data.list_stats));
                break;
        }
    }).catch(error => {
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
const editContent = (id, notify, button, _ref3) => {
    let pageFunc = _ref3.pageFunc,
        replyContentFunc = _ref3.replyContentFunc,
        replyFunc = _ref3.replyFunc,
        keyboardFunc = _ref3.keyboardFunc,
        aboutFunc = _ref3.aboutFunc;
    return new Promise((resolve, reject) => {
        pageFunc(id).then(content => {
            switch (button) {
                case 'info':
                    return {
                        message: replyContentFunc({ content: content, notify: notify }),
                        keyboard: keyboardFunc(id, 'info')
                    };
                case 'all':
                    return {
                        // Even though manga for now won't use notify this arg must be passed through so when it's available only
                        // replyFunc should be altered
                        message: replyFunc({ content: content, notify: notify }),
                        keyboard: keyboardFunc(id, 'all')
                    };
                case 'about':
                    return {
                        message: aboutFunc({ content: content, notify: notify }),
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
};

/**
 * This function edit anime content in Watchlist to show more info about it.
 * @param {Number} id - Anime ID
 * @param {String} button - What button was pressed
 * @returns {JSON} New content message to be edited.
 */
const editContentInfo = (db, user_id, content_id, kind, button) => new Promise((resolve, reject) => {
    let info, functions;

    switch (kind) {
        case 'anime':
            info = db.fetchAnime(user_id, content_id);
            functions = {
                pageFunc: _search.animePage,
                replyContentFunc: _reply.replyAnimeInfo,
                replyFunc: _reply.replyAnimeWatchlist,
                keyboardFunc: _keyboard.animeKeyboardWatchlist,
                aboutFunc: _reply.replyAboutAnime
            };
            break;
        case 'manga':
            info = db.fetchManga(user_id, content_id);
            functions = {
                pageFunc: _search.mangaPage,
                replyContentFunc: _reply.replyMangaInfo,
                replyFunc: _reply.replyMangaReadlist,
                keyboardFunc: _keyboard.mangaKeyboardReadlist,
                aboutFunc: _reply.replyAboutManga
            };
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
        const notify = data.notify ? 'Enabled' : 'Disabled';
        const time = data.time ? (0, _momentTimezone2.default)(data.time).format('LT') : 'None';

        return {
            message: `${_utils.line} User ${_utils.line}\nNotify: ${notify}\nTime for notifications: ${time}\n`,
            keyboard: (0, _keyboard.userKeyboard)(id)
        };
    });
};

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
    })).then(value => {
        return value.filter(element => element.content);
    }).then(data => {
        return Promise.all(positions.map(pos => {
            if (0 <= pos && pos <= data.length) return data[pos];else undefined;
        }));
    }).then(value => {
        return value.filter(element => element);
    }).then(indexes => {
        if (0 < indexes.length) return Promise.all(indexes.map(element => {
            return {
                message: replyFunc(element),
                keyboard: keyboardFunc(element.content.id, 'all')
            };
        })).catch(error => {
            throw error;
        });else return [{
            message: '*Invalid index*',
            keyboard: { parse_mode: 'Markdown' }
        }];
    }).then(data => resolve(data)).catch(error => {
        console.log('[Error] list:', error);
        return [{
            error: '*Content not found*',
            keyboard: { parse_mode: 'Markdown' }
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
        if (content) return content;else resolve({
            error: '*Empty tab*',
            parse_mode: 'Markdown'
        });
    }).then(fetch => getList(fetch, positions, button, filterAnimeByPage, _reply.replyAnimeWatchlist, _keyboard.animeKeyboardWatchlist)).then(resolve);
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
        if (content) return content;else resolve({
            error: '*Empty tab*',
            parse_mode: 'Markdown'
        });
    }).then(fetch => getList(fetch, positions, button, filterMangaByPage, _reply.replyMangaReadlist, _keyboard.mangaKeyboardReadlist)).then(resolve);
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
        if (content) return content;else resolve({
            message: `*Empty ${button} tab*\nPlease, try adding some content to it.`,
            keyboard: { parse_mode: 'Markdown' }
        });
    }).then(fetch => {
        watchlistContentLayout(user, button, fetch).then(resolve);
    }).catch(error => {
        console.log('[Error] watchlistMore', error);
        resolve({
            message: `*Server error*\nPlease, inform @Farmy about it.`,
            keyboard: { parse_mode: 'Markdown' }
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
        if (content) return content;else resolve({
            message: `*Empty ${button} tab*\nPlease, try adding some content to it.`,
            keyboard: { parse_mode: 'Markdown' }
        });
    }).then(fetch => {
        readlistContentLayout(user, button, fetch).then(resolve);
    }).catch(error => {
        console.log('[Error] readlistMore', error);
        resolve({
            message: `*Server error*\nPlease, inform @Farmy about it.`,
            keyboard: { parse_mode: 'Markdown' }
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
    switch (kind) {
        case 'anime':
            db.fetchAnime(user, id).then(response => {
                if (response) (0, _search.animePage)(response.content).then(anime => {
                    resolve({
                        message: (0, _reply.replyAnimeWatchlist)({ content: anime, notify: response.notify }),
                        keyboard: (0, _keyboard.animeKeyboardWatchlist)(response.content, 'all')
                    });
                });else resolve({
                    message: 'Content not found',
                    keyboard: undefined
                });
            });
            break;
        case 'manga':
            db.fetchManga(user, id).then(response => {
                if (response) (0, _search.mangaPage)(response.content).then(manga => {
                    resolve({
                        message: (0, _reply.replyMangaReadlist)({ content: manga }),
                        keyboard: (0, _keyboard.mangaKeyboardReadlist)(response.content, 'all')
                    });
                });else resolve({
                    message: 'Content not found',
                    keyboard: undefined
                });
            });
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
        return (0, _search.animePage)(element.content).then(response => {
            if (response.airing) return { response: response, notify: element.notify };else return undefined;
        });
    }))
    // Remove all undefined values -- all not airing animes.
    .then(data => data.filter(element => element))
    // Sorts all releasing animes
    .then(data => data.sort((key_1, key_2) => {
        return key_1.response.airing.countdown - key_2.response.airing.countdown;
    })).then(data => {
        return data.map((element, index) => {
            return `${_utils.line} ${(0, _utils.romanize)(index + 1)} ${_utils.line}\n`.concat((0, _reply.replyCountdown)(element.response, element.notify));
        });
    }).then(data => `${_utils.line} COUNTDOWN ${_utils.line}\n`.concat(data.join('\n'))).then(resolve).catch(reject);
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
const buttons = (db, _ref4) => {
    let message = _ref4.message,
        user = _ref4.user,
        chat = _ref4.chat,
        args = _ref4.args;
    return new Promise((resolve, reject) => {
        // type: content / kind: anime or character or staff or studio or watchlist tab /
        // id: content id / button: wich button was pressed
        var _args$split = args.split('/'),
            _args$split2 = _slicedToArray(_args$split, 4);

        const type = _args$split2[0],
              id = _args$split2[1],
              kind = _args$split2[2],
              button = _args$split2[3];

        const loadingScreen = { message: 'Loading...', visualization: false };

        switch (type) {
            case 'search':
                searchContentInfo(user, kind, id, button).then(data => {
                    resolve({ message: data, visualization: true });
                }).catch(error => console.log('[Error] buttons anime/staff/character:', error));
                break;
            case 'info':
                editContentInfo(db, user, id, kind, button).then(data => {
                    _utils.telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons info:', error));
                resolve(loadingScreen);
                break;
            case 'user':
                if (kind && 'notification' == kind) db.toggleNotifications(user).then(response => {
                    userInfo(db, user).then(data => {
                        _utils.telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
                    }).catch(error => console.log('[Error] buttons about:', error));
                });else userInfo(db, user).then(data => {
                    _utils.telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons about:', error));
                resolve(loadingScreen);
                break;
            case 'menu':
                _utils.telegram.editMessageText(chat, message, undefined, _utils.menu, (0, _keyboard.menuKeyboard)(user));
                resolve(loadingScreen);
                break;
            case 'watchlist':
                if ('more' == kind) watchlistMore(db, user, button).then(data => {
                    _utils.telegram.sendMessage(user, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons watchlist more:', error));else fetchWatchlist(db, kind, user).then(data => {
                    _utils.telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons watchlist fetchWatchlist:', error));

                resolve(loadingScreen);
                break;
            case 'readlist':
                if ('more' == kind) readlistMore(db, user, button).then(data => {
                    _utils.telegram.sendMessage(user, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons readlist more:', error));else fetchReadlist(db, kind, user).then(data => {
                    _utils.telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons readlist:', error));
                resolve(loadingScreen);
                break;
            case 'guide':
                _utils.telegram.editMessageText(chat, message, undefined, _utils.cmdMessage, (0, _keyboard.guideKeyboard)(user));
                resolve(loadingScreen);
                break;
            case 'about':
                _utils.telegram.editMessageText(chat, message, undefined, _utils.aboutBot, (0, _keyboard.aboutKeyboard)(user));
                resolve(loadingScreen);
                break;
            case 'subscribe':
                db.subscribe(user, id, kind).then(added => {
                    if (added) {
                        let text;

                        switch (kind) {
                            case 'anime':
                                text = "Added to your Watchlist!\nIf you don't want to be notified upon new episodes, \
open chat with ANILISTbot and see the guide in Menu.";
                                break;
                            case 'manga':
                                text = 'Added to your Readlist!\nSee it in a chat with ANILISTbot, just press Menu.';
                                break;
                        }

                        resolve({ message: text, visualization: true });
                    } else resolve({ message: `This ${kind} is already in your list`, visualization: true });
                }).catch(error => console.log('[Error] buttons subscribe:', error));
                break;
            case 'unsubscribe':
                db.unsubscribe(user, id, kind).then(removed => {
                    if (removed) {
                        switch (kind) {
                            case 'anime':
                                (0, _search.animeID)(id).then(anime => {
                                    _utils.telegram.editMessageText(chat, message, undefined, (0, _reply.replyAnime)(anime), (0, _keyboard.animeKeyboardSearch)(id));
                                    resolve({ message: 'Removed from your watchlist', visualization: true });
                                }).catch(error => {
                                    throw error;
                                });
                                break;
                            case 'manga':
                                (0, _search.mangaID)(id).then(manga => {
                                    _utils.telegram.editMessageText(chat, message, undefined, (0, _reply.replyManga)(manga), (0, _keyboard.mangaKeyboardSearch)(id));
                                    resolve({ message: 'Removed from your readlist', visualization: true });
                                }).catch(error => {
                                    throw error;
                                });
                                break;
                        }
                    } else resolve({ message: `This ${kind} is not in your list`, visualization: true });
                }).catch(error => console.log('[Error] buttons unsubscribe:', error));
                break;
            case 'notify':
                db.toggleAnime(user, id).then(toggled => {
                    db.fetchAnime(user, id).then(anime => {
                        return (0, _search.animePage)(anime.content).then(content => {
                            return {
                                notify: anime.notify,
                                content: content
                            };
                        }).catch(error => {
                            throw error;
                        });
                    }).then(anime => {
                        let layout;

                        switch (kind) {
                            case 'all':
                                layout = (0, _reply.replyAnimeWatchlist)(anime);
                                break;
                            case 'info':
                                layout = (0, _reply.replyAnimeInfo)(anime);
                                break;
                            case 'about':
                                layout = (0, _reply.replyAboutAnime)(anime);
                                break;
                        }

                        resolve({ message: `Notification changed to: ${anime.notify ? 'Enabled' : 'Disabled'}`,
                            visualization: true });
                        _utils.telegram.editMessageText(chat, message, undefined, layout, (0, _keyboard.animeKeyboardWatchlist)(id, kind));
                    }).catch(error => {
                        throw error;
                    });
                }).catch(error => console.log('[Error] buttons notify:', error));
                break;
            case 'countdown':
                db.fetchAnimes(user).then(animes => {
                    showCountdown(animes).then(data => {
                        _utils.telegram.editMessageText(chat, message, undefined, data, (0, _keyboard.countdownKeyboard)(user));
                    }).catch(error => {
                        throw error;
                    });
                }).catch(error => console.log('[Error] buttons countdown:', error));
                resolve(loadingScreen);
                break;
            case 'time':
                if ('all' == kind) db.getUserTime(user).then(time => {
                    // User hasn't set any time for notifications yet.
                    if (!time) _utils.telegram.sendMessage(chat, 'Send your location or search it for your timezone.', (0, _keyboard.locationKeyboard)(user));else _utils.telegram.sendMessage(chat, 'I already have your timezone. Wanna change it or just update \
                        notification time?', (0, _keyboard.updateTimeKeyboard)(user));
                });else if ('remove' == kind) db.removeTime(user).then(removed => {
                    if (removed) _utils.telegram.sendMessage(chat, 'Removed time for notifications.', (0, _keyboard.startKeyboard)(user));else _utils.telegram.sendMessage(chat, 'Time for notifications already removed.', (0, _keyboard.startKeyboard)(user));
                }).catch(error => console.log('[Error] buttons time remove:', error));else {
                    db.setTime(user, kind, button).then(response => {
                        if (response) _utils.telegram.sendMessage(chat, 'Time for notifications setted.', (0, _keyboard.startKeyboard)(user));else _utils.telegram.sendMessage(chat, 'Some error occured, please inform @Farmy about that.', (0, _keyboard.startKeyboard)(user));
                    }).catch(error => console.log('[Error] buttons time set:', error));
                }
                resolve(loadingScreen);
                break;
            case 'timezone':
                notificationTime(db, user, (0, _momentTimezone2.default)().tz(kind.concat(`/${button}`)).format());
                break;
            case 'more':
                fetchMore(db, user, id, kind).then(data => {
                    _utils.telegram.sendMessage(chat, data.message, data.keyboard);
                }).catch(error => console.log('[Error] buttons fetchMore', error));
                resolve(loadingScreen);
                break;
            default:
                resolve({ message: 'Button error', visualization: true });
        }
    });
};

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    buttons: buttons,
    notifyRelease: notifyRelease,
    notifyUserReleases: notifyUserReleases,
    changeTime: changeTime,
    setTimezone: setTimezone,
    notificationTime: notificationTime
};