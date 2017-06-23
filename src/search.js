'use strict';

import {
    searchMessage,
    notFound,
    logo_al
} from './utils';

import {
    replyCallback,
    replyUsers,
    replyStatus,
    replyAnime,
    replyManga,
    replyAnimeWatchlist,
    replyCharacter,
    replyStaff,
    replyStudio,
    replyWatchlist,
    replyAnimeNotify,
    replyNotify,
    replyInline,
    replyBrowse
} from './reply';

import {
    animeKeyboardSearch,
    animeKeyboardNotify,
    characterKeyboard,
    staffKeyboard,
    watchlistKeyboard,
    mangaKeyboardSearch
} from './keyboard';

import nani from 'nani';

nani.init(process.env.NANI_ID, process.env.NANI_TOKEN);

/***********************************************************************************************************************
 *********************************************** SEARCH FUNCTIONS ******************************************************
 **********************************************************************************************************************/

/**
 * Search Anilist database.
 * @param {string} value - Item to be searched for.
 * @param {string} type - What type of search must be done: anime, character, staff or studio.
 * @param {function} reply - Function to set data into Telegram standars.
 * @param {function} keyboard - Function to attach buttons into message.
 * @returns An object that contains the message to be printed and the parse mode.
 */
const getSearch = (value, {type, reply, keyboard}) => new Promise((resolve, reject) => {
    nani.get(`${type}/search/${value}`).then(data => {
        if(!data.hasOwnProperty('error'))
            resolve({
                message: reply(data[0]),
                // Studio has no keyboard
                keyboard: (keyboard) ? keyboard(data[0].id) : {parse_mode: 'Markdown'},
            });
        else
            reject('error');
    }).catch(error => {
        error.description = error;  
        reject(error);
    });
});

/**
 * Search for anime and returns it all the gathered data.
 * @param {string} anime - Anime name.
 * @returns {string} Fetched data in Telegram standards.
 */
const animeSearch = anime => getSearch(anime, {type: 'anime', reply: replyAnime, keyboard: animeKeyboardSearch});

/**
 * Search for character and returns it all the gathered data.
 * @param {string} character - Character name.
 * @returns {string} Fetched data in Telegram standards.
 */
const characterSearch = character => getSearch(character, {type: 'character', reply: replyCharacter, keyboard: characterKeyboard});

/**
 * Search for staff and fetch it the gathered data.
 * @param {string} staff - Value of search.
 * @returns {string} Fetched data in Telegram standards.
 */
const staffSearch = staff => getSearch(staff, {type: 'staff', reply: replyStaff, keyboard: staffKeyboard});

/**
 * Search for studio and fetch it the gathered data.
 * @param {string} studio - Value of search.
 * @returns {string} Fetched data in Telegram standards.
 */
const studioSearch = studio => getSearch(studio, {type: 'studio', reply: replyStudio});

/**
 * Search for manga and fetch it the gathered data.
 * @param {string} manga - Value of search.
 * @returns {string} Fetched data in Telegram standards.
 */
const mangaSearch = manga => getSearch(manga, {type: 'manga', reply: replyManga, keyboard: mangaKeyboardSearch});

/***********************************************************************************************************************
 ********************************************* SEARCH ALL FUNCTIONS ****************************************************
 **********************************************************************************************************************/

/**
 * Search Anilist database.
 * @param {string} value - Item to be searched for.
 * @param {string} type - What type of search must be done: anime, character, staff or studio.
 * @returns An object that contains the message to be printed and the parse mode.
 */
const searchAll = (type, value) => new Promise((resolve, reject) => {
    nani.get(`${type}/search/${value}`).then(data => {
        if(!data.hasOwnProperty('error'))
            resolve(data);
        else
            reject('error');
    }).catch(error => {
        error.description = error;  
        reject(error);
    });
});

/**
 * Search for anime and returns it all the gathered data.
 * @param {string} anime - Anime name.
 * @returns {string} Fetched data in Telegram standards.
 */
const animeSearchAll = anime => searchAll('anime', anime);

/**
 * Search for character and returns it all the gathered data.
 * @param {string} character - Character name.
 * @returns {string} Fetched data in Telegram standards.
 */
const characterSearchAll = character => searchAll('character', character);

/**
 * Search for staff and fetch it the gathered data.
 * @param {string} staff - Value of search.
 * @returns {string} Fetched data in Telegram standards.
 */
const staffSearchAll = staff => searchAll('staff', staff);

/**
 * Search for studio and fetch it the gathered data.
 * @param {string} studio - Value of search.
 * @returns {string} Fetched data in Telegram standards.
 */
const studioSearchAll = studio => searchAll('studio', studio);

/**
 * Search for manga and fetch it the gathered data.
 * @param {string} manga - Value of search.
 * @returns {string} Fetched data in Telegram standards.
 */
const mangaSearchAll = manga => searchAll('manga', manga);

/***********************************************************************************************************************
 ************************************************ PAGE FUNCTIONS *******************************************************
 **********************************************************************************************************************/

/**
 * Fetch all available info about given type: anime or manga.
 * @param {Number} id - Content id.
 * @returns {JSON} Data.
 */
const page = (type, id) => new Promise((resolve, reject) => {
    nani.get(`${type}/${id}/page`).then(data => {
        if(!data.hasOwnProperty('error'))
            resolve(data);
        else
            resolve('error');
    }).catch(error => {
        console.log('[Error] page:', error);
        reject(error);
    });
});

/**
 * Fetch all available info about given anime.
 * @param {Number} id - Anime ID.
 * @returns {JSON} Data.
 */
const animePage = id => page('anime', id);

/**
 * Fetch all available info about given manga.
 * @param {Number} id - manga ID.
 * @returns {JSON} Data.
 */
const mangaPage = id => page('manga', id);

/***********************************************************************************************************************
 *********************************************** SEARCH ID FUNCTIONS ***************************************************
 **********************************************************************************************************************/

/**
 * Given a type and an id returns a formated Telegram layout info.
 * @param {String} type - Kind of search want to perform.
 * @param {Number} id - Conent id.
 * @returns {JSON} Data.
 */
const getID = (type, id) => new Promise((resolve, reject) => {
    nani.get(`${type}/${id}`).then(data => {
        if(!data.hasOwnProperty('error'))
            resolve(data);
        else
            resolve('error');
    }).catch((error) => {
        console.log('[Error] getID:', error);
        reject(error);
    });
});

/**
 * This function returns data about the manga id.
 * @param {Number} id - Manga id. 
 * @returns {JSON} Data.
 */
const mangaID = id => getID('manga', id);

/**
 * This function returns data about the anime id.
 * @param {Number} id - Anime id. 
 * @returns {JSON} Data.
 */
const animeID = id => getID('anime', id);

/**
 * This function returns data about the character id.
 * @param {Number} id - Character id. 
 * @returns {JSON} Data.
 */
const characterID = id => getID('character', id);

/**
 * This function returns data about the staff id.
 * @param {Number} id - Staff id. 
 * @returns {JSON} Data.
 */
const staffID = id => getID('staff', id);

/**
 * This function returns data about the studio id.
 * @param {Number} id - Studio id. 
 * @returns {JSON} Data.
 */
const studioID = id => getID('studio', id);

/***********************************************************************************************************************
 ************************************************ BROWSE FUNCTIONS *****************************************************
 **********************************************************************************************************************/

/**
 * Given a type and an id returns a formated Telegram layout info.
 * @param {String} type - Kind of search want to perform.
 * @returns {JSON} Data.
 */
const getBrowse = (type) => new Promise((resolve, reject) => {
    nani.get(`browse/${type}`).then(data => {
        if(!data.hasOwnProperty('error'))
            return data;
        else
            resolve('error');
    }).then(data => data.map(element => replyBrowse(type, element))).then(resolve)
    .catch((error) => {
        console.log('[Error] getBrowse:', error);
        reject(error);
    });
});

/**
 * This function browse mangas.
 * @returns {JSON} Data.
 */
const mangaBrowse = () => getBrowse('manga');

/**
 * This function browse animes.
 * @returns {JSON} Data.
 */
const animeBrowse = () => getBrowse('anime');

/**
 * Anilist API doesn't support yet some kind of browsing. This function informs user about.
 * @param {String} type - Kind of not yet available browse.
 * @returns {JSON} Warning about not available browse.
 */
const notAvailableBrowse = (type) => new Promise((resolve, reject) => {
    resolve([{
        id: '0',
        title: `${type} browse isn't yet available`,
        type: 'article',
        input_message_content: {
            message_text: `*${type} browse isn't yet available*`,
            parse_mode: 'Markdown',
        },
        reply_markup: undefined,
        description: `${type} browse isn't yet available`,
        thumb_url: logo_al
    }]);
});

/**
 * This function browse characters.
 * @returns {JSON} Data.
 */
const characterBrowse = () => notAvailableBrowse('Character');

/**
 * This function browse staffs.
 * @returns {JSON} Data.
 */
const staffBrowse = () => notAvailableBrowse('Staff');

/**
 * This function browse studios.
 * @returns {JSON} Data.
 */
const studioBrowse = () => notAvailableBrowse('Studio');

/***********************************************************************************************************************
 ********************************************** INLINESEARCH FUNCTION **************************************************
 **********************************************************************************************************************/

/**
 * This function fetch all content data and returns it to inline search.
 * @param {String} type - Kind of search.
 * @param {String} search - Item to be searched for.
 * @param {Function} funcBrowse - Browse function.
 * @param {Function} funcSearch - Search function.
 * @returns {JSON} Telegram query search layout content.
 */
const inlineSearchByType = (type, search, browseFunc, funcSearch) => {
    if('' == search)
        return browseFunc();
    else
        return funcSearch(search).then(data => (!data.hasOwnProperty('error')) ? data.map(element => replyInline(type, element)) : []);
}

/**
 * This function fetch all manga data and returns it to inline search.
 * @param {String} search - Item to be searched for.
 * @returns {JSON} Telegram query search layout content.
 */
const inlineSearchManga = (search) => inlineSearchByType('manga', `${search.replace('manga', '')}`, mangaBrowse, mangaSearchAll);

/**
 * This function fetch all anime data and returns it to inline search.
 * @param {String} search - Item to be searched for.
 * @returns {JSON} Telegram query search layout content.
 */
const inlineSearchAnime = (search) => inlineSearchByType('anime', `${search.replace('anime', '')}`, animeBrowse, animeSearchAll);

/**
 * This function fetch all anime data and returns it to inline search.
 * @param {String} search - Item to be searched for.
 * @returns {JSON} Telegram query search layout content.
 */
const inlineSearchCharacter = (search) => inlineSearchByType('character', `${search.replace('character', '')}`, characterBrowse, characterSearchAll);

/**
 * This function fetch all staff data and returns it to inline search.
 * @param {String} search - Item to be searched for.
 * @returns {JSON} Telegram query search layout content.
 */
const inlineSearchStaff = (search) => inlineSearchByType('staff', `${search.replace('staff', '')}`, staffBrowse, staffSearchAll);

/**
 * This function fetch all studio data and returns it to inline search.
 * @param {String} search - Item to be searched for.
 * @returns {JSON} Telegram query search layout content.
 */
const inlineSearchStudio = (search) => inlineSearchByType('studio', `${search.replace('studio', '')}`, studioBrowse, studioSearchAll);

/**
 * This function fetch all studio data and returns it to inline search.
 * @param {String} search - Item to be searched for.
 * @returns {JSON} Telegram query search layout content.
 */
const inlineSearchAll = (search) => {
    const types = ['anime', 'manga', 'character', 'staff', 'studio'];
    
    return Promise.all(types.map(type => nani.get(`${type}/search/${search}`)
        .then(data => (!data.hasOwnProperty('error')) ? data.map(element => replyInline(type, element)) : [])));
}

/**
 * Search it all the matches for the user query.
 * @param {string} query - User input.
 * @param {Number} offset - Start of array response.
 * @param {Number} limit - Ends of array response.
 * @returns {Object[]} All of searched data in Telegram inline standards.
 */
const inlineSearch = (query, offset, limit) => new Promise((resolve, reject) => {
    let search;

    // User hasn't typed anything yet
    if('' == query)
        search = Promise.resolve([searchMessage]);

    else {
        // Case that the user want to search about specific content
        // Why  not  use  'includes'  instead of a Regex? I tried once, but in cases like searches for 'Eromanga-sensei'
        // doesn't work to well
        if(/\bmanga\b/.exec(query))
            search = inlineSearchManga(query);

        else if(query.includes('anime'))
            search = inlineSearchAnime(query);

        else if(query.includes('character'))
            search = inlineSearchCharacter(query);
        
        else if(query.includes('staff'))
            search = inlineSearchStaff(query);
        
        else if(query.includes('studio'))
            search = inlineSearchStudio(query);

        // Search about all types
        else
            search = inlineSearchAll(query);
    }

    resolve(search.then(data => data.reduce((acc, cur) => acc.concat(cur), []))
    .then(data => (0 == data.length) ? undefined : data.splice(offset, limit))
    .catch(error => {
        console.log('[Error] inlineSearch:', error);
        return undefined;
    }));
});

/***********************************************************************************************************************
 ************************************************* COMMOM FUNCTIONS ****************************************************
 **********************************************************************************************************************/

/**
 * This function search for how much longer to a new episode of an airing anime be released.
 * @param {Number} id - Anime ID.
 * @returns {Numebr} Seconds to new episode release.
 */
const searchAnimeCountdown = id => new Promise((resolve, reject) => {
    animeID(id).then(anime => (null != anime.airing) ? resolve(anime.airing.countdown) : resolve(undefined)).catch(reject);
});

/**
 * This function search for how much longer to a new episode of an airing anime be released.
 * @param {Number} id - Anime ID.
 * @returns {Numebr} Seconds to new episode release.
 */
const searchAnimeRelaseDate = id => new Promise((resolve, reject) => {
    animeID(id).then(anime => (null != anime.airing) ? resolve(anime.airing.time) : resolve(undefined)).catch(reject);
});

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    getID,
    animePage,
    mangaPage,
    animeID,
    mangaID,
    characterID,
    staffID,
    studioID,
    animeSearch,
    characterSearch,
    staffSearch,
    mangaSearch,
    studioSearch,
    inlineSearch,
    searchAnimeRelaseDate
}
