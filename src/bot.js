'use strict';

import {
    telegram,
    menu,
    serverError,
    line,
    indexMessage,
    removeCmd,
    watchMessage,
    cmdMessage,
    help
} from './utils';

import {
    menuKeyboard,
    aboutKeyboard,
    cmdKeyboard,
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
    replyInline,
    replyAboutAnime,
    replyAboutManga
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
    getID
} from './search';

/***********************************************************************************************************************
 ************************************************ BOT FUNCTIONS ********************************************************
 **********************************************************************************************************************/

/**
 * This function query all users that added given anime to watchlist then make a layout update of it.
 * @param {Number} anime - Anime id.
 * @param {Object[Number]} chats - Chats ids.
 * @returns Nothing, just sent the user a message.
 */
const notifyRelease = (anime, chats) => {
    animePage(anime).then(data => {
        const reply = replyNotify(data);
        chats.forEach(chat => telegram.sendMessage(chat, reply.message, reply.keyboard));
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
 * @param {String} kind - Kind of list.
 * @param {Number} user - User id.
 * @returns {Objetct[String]} List layout.
 */
const listLayout = (array, button, user, kind) => {
    return Promise.all(array.map((data, index) => replyList(index, data)))
    .then(data => {
        const content = (0 < data.length) ? data : 'Empty';

        return [`${line} ${kind} ${line}\n${line} ${button.toUpperCase()} ${line}`].concat(content).join('\n');
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
const watchlistLayout = (array, button, user) => listLayout(array, button, user, 'WATCHLIST');

/**
 * This function sets all manga content to Telegram layout.
 * @param {JSON} array - Data text.
 * @param {String} button - Keyboard that's calling it.
 * @param {Number} user - User id.
 * @returns {Objetct[String]} Readlist layout.
 */
const readlistLayout = (array, button, user) => listLayout(array, button, user, 'READLIST');

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
            fetchList(db.fetchAnimes(user), button, user, 'WATCHLIST', watchlistKeyboard, filterAnimeByStatus, watchlistLayout)
            .then(resolve).catch(error => {
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
            fetchList(db.fetchMangas(user), button, user, 'READLIST', readlistKeyboard, filterMangaByStatus, readlistLayout)
            .then(resolve).catch(error => {
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
        return {
            message: `${line} User ${line}\nNotify: ${(data.notify) ? 'Enabled' : 'Disabled'}`,
            keyboard: aboutKeyboard(id)
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

/**
 * This function answer the response for data in buttons.
 * @param {DB} db - Users database.
 * @param {Number} user - Users id.
 * @param {String} header - Chat id.
 * @param {String} index - Wich anime show content.
 * @returns {JSON} Message to be printed and keyboard attached to it.
 */
const list = (db, {header, user, index, kind}) => new Promise((resolve, reject) => {
    const positions = verifyNumbers(index);
    const button = kind.toLowerCase();

    if('all' == button || 'airing' == button || 'publishing' == button || 'completed' == button || 'cancelled' == button) {
        if(0 < positions.length) {
            switch(header) {
                case 'WATCHLIST':
                    resolve(watchlist(db, user, button, positions));
                    break;
                case 'READLIST':
                    resolve(readlist(db, user, button, positions));
                    break;
                default:
                    resolve([{
                        message: '*Invalid kind*',
                        keyboard: {parse_mode: 'Markdown'}
                    }]);
            }
        }

        else
            resolve([{
                message: '*Invalid index*',
                keyboard: {parse_mode: 'Markdown'}
            }]);
    }

    else
        resolve([{
            message: '*Invalid reply message*',
            keyboard: {parse_mode: 'Markdown'}
        }]);
});

/***********************************************************************************************************************
 ************************************************ COMMON FUNCTIONS *****************************************************
 **********************************************************************************************************************/

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
                resolve({message: data, visualization: true})
            }).catch(error => console.log('[Error] buttons anime/staff/character:', error));
            break;
        case 'info':
            editContentInfo(db, user, id, kind, button).then(data => {
                telegram.editMessageText(chat, message, undefined, data.message, data.keyboard)
            }).catch(error => console.log('[Error] buttons info:', error));
            resolve(loadingScreen);
            break;
        case 'user':
            userInfo(db, user).then(data => {
                telegram.editMessageText(chat, message, undefined, data.message, data.keyboard)
            }).catch(error => console.log('[Error] buttons about:', error));
            resolve(loadingScreen);
            break;
        case 'menu':
            telegram.editMessageText(chat, message, undefined, menu, menuKeyboard(user))
            .catch(error => console.log('[Error] buttons menu:', error));
            resolve(loadingScreen);
            break;
        case 'watchlist':
            fetchWatchlist(db, kind, user).then(data => {
                telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
            }).catch(error => console.log('[Error] buttons watchlist:', error));
            resolve(loadingScreen);
            break;
        case 'readlist':
            fetchReadlist(db, kind, user).then(data => {
                telegram.editMessageText(chat, message, undefined, data.message, data.keyboard);
            }).catch(error => console.log('[Error] buttons readlist:', error));
            resolve(loadingScreen);
            break;
        case 'guide':
            telegram.editMessageText(chat, message, undefined, cmdMessage, cmdKeyboard(user));
            resolve(loadingScreen);
            break;
        case 'subscribe':
            db.subscribe(user, id, kind).then(added => {
                if(added) {
                    let text;

                    switch(kind) {
                        case 'anime':
                            text = "Added to your Watchlist!\nIf you don't want to be notified upon new episodes, open chat with ANILISTbot and see the guide in /menu.";
                            break;
                        case 'manga':
                            text = 'Added to your Readlist!\nTo see it just open a chat with ANILISTbot and type /menu.';
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
                                telegram.editMessageText(chat, message, undefined, replyAnime(anime), animeKeyboardSearch(id));
                                resolve({message: 'Removed from your watchlist', visualization: true});
                            }).catch(error => {throw error;});
                            break;
                        case 'manga':
                            mangaID(id).then(manga => {
                                telegram.editMessageText(chat, message, undefined, replyManga(manga), mangaKeyboardSearch(id));
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

                    telegram.editMessageText(chat, message, undefined, layout, animeKeyboardWatchlist(id, kind));
                }).catch(error => {throw error;});
                resolve(loadingScreen);
            }).catch(error => console.log('[Error] buttons notify:', error));
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
    list,
    notifyRelease
}
