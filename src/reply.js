'use strict';

import {
    verifyData,
    verifyNumber,
    verifyString,
    verifyStringNumber,
    verifyName,
    verifyTitle,
    verifyJPTitle,
    verifyENTitle,
    verifyObject,
    verifyButton,
    verifyMD,
    verifyYT,
    verifyWS,
    verifyDate,
    verifyAdult,
    verifyNumbers,
    verifyWatchLink,
    verifyNextEpisode,
    verifyEpisodes,
    verifyScore,
    verifyChapters,
    verifyVolumes,
    verifyRole,
    verifyEmptyString,
    verifyCountdown,
    verifyType
} from './verify';

import {
    helpKeyboard,
    cmdKeyboard,
    mangaKeyboardSearch,
    animeKeyboardWatchlist,
    animeKeyboardSearch,
    characterKeyboard,
    staffKeyboard,
    watchlistKeyboard
} from './keyboard';

import {
    line,
    logo_al
} from './utils';

/***********************************************************************************************************************
 ********************************************** REPLY BROWSE FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * Set the anime browse data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyBrowseAnime = data => {
    const japanese = verifyJPTitle(data.title_japanese);
    const english = verifyENTitle(data.title_english);
    const type = verifyMD(data.series_type, data.type);
    const start = verifyDate('Start date', data.start_date);
    const end = verifyDate('End date', data.end_date);
    const status = verifyMD('Status', data.airing_status);
    const popularity = verifyMD('Popularity', data.popularity);
    const score = verifyScore(data.average_score);
    const episodes = verifyEpisodes(data.total_episodes);

    /*  \u200B is the invisible emoji   */
    return `[\u200B](${data.image_url_lge})${japanese}${english}${type}${score}${status}${episodes}${popularity}\
${start}${end}`;
}


/**
 * Set the manga browse data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyBrowseManga = data => {
    const japanese = verifyJPTitle(data.title_japanese);
    const english = verifyENTitle(data.title_english);
    const type = verifyMD(data.series_type, data.type);
    const start = verifyDate('Start date', data.start_date);
    const end = verifyDate('End date', data.end_date);
    const status = verifyMD('Status', data.publishing_status);
    const popularity = verifyMD('Popularity', data.popularity);
    const score = verifyScore(data.average_score);
    const volumes = verifyVolumes(data.total_volumes);
    const chapters = verifyChapters(data.total_chapters);

    return `[\u200B](${data.image_url_lge})${japanese}${english}${type}${score}${status}${volumes}${chapters}\
${popularity}${start}${end}`;
}

/**
 * Set Anilist data converted to inline browse response on Telegram.
 * @param {string} type - What kind of content data represents
 * @param {json} data - Anilist data
 * @returns {json} Anilist data set in Telegram standards.
 */
const replyBrowse = (type, data) => {
    let dataId, dataTitle, messageText, keyboardMarkup, dataDescription, thumbUrl;

    switch(type) {
        case 'manga':
            dataTitle = `[MANGA] ${data.title_english}`;
            messageText = replyBrowseManga(data);
            keyboardMarkup = mangaKeyboardSearch(data.id).reply_markup;
            thumbUrl = data.image_url_med;
            break;
        case 'anime':
            dataTitle = `[ANIME] ${data.title_english}`;
            messageText = replyBrowseAnime(data);
            keyboardMarkup = animeKeyboardSearch(data.id).reply_markup;
            thumbUrl = data.image_url_med;
            break;
        case 'character':
            dataTitle = `[CHARACTER] ${data.name_first}`;
            messageText = replyBrowseCharacter(data);
            keyboardMarkup = characterKeyboard(data.id).reply_markup;
            thumbUrl = data.image_url_lge;
            break;
        case 'staff':
            dataTitle = `[STAFF] ${data.name_first}`;
            messageText = replyBrowseStaff(data);
            keyboardMarkup = staffKeyboard(data.id, 'staff').reply_markup;
            thumbUrl = data.image_url_lge;
            break;
        case 'studio':
            dataTitle = `[STUDIO] ${data.studio_name}`;
            messageText = replyBrowseStudio(data);
            keyboardMarkup = undefined;
            thumbUrl = logo_al;
            break
    }

    return {
        id: `${data.id}`,
        title: dataTitle,
        type: 'article',
        input_message_content: {
            message_text: messageText,
            parse_mode: 'Markdown',
        },
        reply_markup: keyboardMarkup,
        description: 'Browse content: for more info about, select it.',
        thumb_url: thumbUrl
    };
}

/***********************************************************************************************************************
 ************************************************ REPLY KIND FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyManga = data => {
    const japanese = verifyJPTitle(data.title_japanese);
    const english = verifyENTitle(data.title_english);
    const youtube = verifyYT(data.youtube_id);
    const adult = verifyAdult(data.adult);
    const type = verifyType(data.type, data.series_type);
    const score = verifyScore(data.average_score);
    const status = verifyMD('Status', data.publishing_status);
    const volumes = verifyVolumes(data.total_volumes);
    const chapters = verifyChapters(data.total_chapters);
    const popularity = verifyMD('Popularity', data.popularity);
    const start = verifyDate('Start date', data.start_date);
    const end = verifyDate('End date', data.end_date);

    return `[\u200B](${data.image_url_lge})${japanese}${english}${youtube}${adult}${type}${score}${status}${volumes}\
${chapters}${popularity}${start}${end}`;
}

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyAnime = data => {
    const japanese = verifyJPTitle(data.title_japanese);
    const english = verifyENTitle(data.title_english);
    const youtube = verifyYT(data.youtube_id);
    const adult = verifyAdult(data.adult);
    const type = verifyType(data.type, data.series_type);
    const score = verifyScore(data.average_score);
    const status = verifyMD('Status', data.airing_status);
    const episodes = verifyEpisodes(data.total_episodes);
    const popularity = verifyMD('Popularity', data.popularity);
    const start = verifyDate('Start date', data.start_date);
    const end = verifyDate('End date', data.end_date);

    return `[\u200B](${data.image_url_lge})${japanese}${english}${youtube}${adult}${type}${score}${status}${episodes}\
${popularity}${start}${end}`;
}

/**
 * Set the character data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyCharacter = data => {
    const firstName = verifyEmptyString(data.name_first);
    const lastName = verifyEmptyString(data.name_last);
    const japanese = verifyJPTitle(data.name_japanese);
    const english = verifyENTitle(`${firstName} ${lastName}`);

    return `[\u200B](${data.image_url_lge})${japanese}${english}`;
}

/**
 * Set the staff data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyStaff = data => {
    const japaneseFirst = verifyEmptyString(data.name_first_japanese);
    const japaneseLast = verifyEmptyString(data.name_last_japanese);
    const englishFirst = verifyEmptyString(data.name_first);
    const englishLast = verifyEmptyString(data.name_last);
    const japanese = verifyJPTitle(`${japaneseFirst} ${japaneseLast}`);
    const english = verifyENTitle(`${englishFirst} ${englishLast}`);
    const language = verifyMD('Language', data.language);
    const website = verifyWS(data.website);

    return `[\u200B](${data.image_url_lge})${japanese}${english}${language}${website}`;
}

/**
 * Set the studio data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyStudio = data => {
    const name = verifyTitle(data.studio_name);
    const website = verifyWS(data.studio_wiki);

    return `[\u200B](${logo_al})${name}${website}`;
}

/***********************************************************************************************************************
 ************************************************ REPLY LIST FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyMangaReadlist = data => {
    const japanese = verifyJPTitle(data.content.title_japanese);
    const english = verifyENTitle(data.content.title_english);
    const youtube = verifyYT(data.content.youtube_id);
    const adult = verifyAdult(data.content.adult);
    const type = verifyType(data.content.type, data.content.series_type);
    const score = verifyScore(data.content.average_score);
    const status = verifyMD('Status', data.content.publishing_status);
    const volumes = verifyVolumes(data.content.total_volumes);
    const chapters = verifyChapters(data.content.total_chapters);
    const popularity = verifyMD('Popularity', data.content.popularity);
    const start = verifyDate('Start date', data.content.start_date);
    const end = verifyDate('End date', data.content.end_date);

    return `[\u200B](${data.content.image_url_lge})${japanese}${english}${youtube}${adult}${type}${score}${status}\
${volumes}${chapters}${popularity}${start}${end}`;
}

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} content - Bot modified Anilist data.
 * @returns {string} Message to be printed.
 */
const replyAnimeWatchlist = data => {
    // console.log(data);
    const japanese = verifyJPTitle(data.content.title_japanese);
    const english = verifyENTitle(data.content.title_english);
    const youtube = verifyYT(data.content.youtube_id);
    const adult = verifyAdult(data.content.adult);
    const type = verifyType(data.content.type, data.content.series_type);
    const score = verifyScore(data.content.average_score);
    const status = verifyMD('Status', data.content.airing_status);
    const episodes = verifyEpisodes(data.content.total_episodes);
    const popularity = verifyMD('Popularity', data.content.popularity);
    const start = verifyDate('Start date', data.content.start_date);
    const end = verifyDate('End date', data.content.end_date);
    const notifications = verifyMD('Notifications', (data.notify) ? 'Enabled' : 'Disabled');
    const next = verifyNextEpisode(data.content.airing);
    const watch = verifyWatchLink(data.content);

    return `[\u200B](${data.content.image_url_lge})${japanese}${english}${youtube}${adult}${type}${score}${status}\
${episodes}${popularity}${start}${end}${notifications}${next}${watch}`;
}

/**
 * Put in a preview layout about the user list data.
 * @param {Number} index - Postion of anime in list.
 * @param {Number} data - Contet.
 * @returns List preview info.
 */
const replyList = (index, data) => {
    const japanese = verifyJPTitle(data.title_japanese);
    const english = verifyENTitle(data.title_english);
    const youtube = verifyYT(data.youtube_id);
    const adult = verifyAdult(data.adult);

    return `${line}\t${index}\t${line}\n${japanese}${english}${youtube}${adult}`;
}

/***********************************************************************************************************************
 *********************************************** REPLY HEADER FUNCTIONS ************************************************
 **********************************************************************************************************************/

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyAnimeHeader = data => {
    const japanese = verifyJPTitle(data.content.title_japanese);
    const english = verifyENTitle(data.content.title_english);
    const youtube = verifyYT(data.content.youtube_id);
    const adult = verifyAdult(data.content.adult);
    const type = verifyType(data.content.type, data.content.series_type);
    const notifications = verifyMD('Notifications', (data.notify) ? 'Enabled' : 'Disabled');

    return `[\u200B](${data.content.image_url_lge})${japanese}${english}${youtube}${adult}${type}${notifications}`;
}

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyMangaHeader = data => {
    const japanese = verifyJPTitle(data.content.title_japanese);
    const english = verifyENTitle(data.content.title_english);
    const youtube = verifyYT(data.content.youtube_id);
    const adult = verifyAdult(data.content.adult);
    const type = verifyType(data.content.type, data.content.series_type);

    return `[\u200B](${data.content.image_url_lge})${japanese}${english}${youtube}${adult}${type}`;
}

/***********************************************************************************************************************
 ************************************************ REPLY INFO FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * This function is to set a new layout about anime info in watchlist.
 * @param {JSON} data - Anime data.
 * @returns {String} Formated layout message for anime.
 */
const replyAnimeInfo = data => {
    return `${replyAnimeHeader(data)}\n*Description:*\n${verifyString(data.content.description)}\n\n\
*Genres:*\n${verifyObject(data.content.genres)}\n\n*Users*:\n${replyUsers(data.content.list_stats)}`;
}

/**
 * This function is to set a new layout about manga info in watchlist.
 * @param {JSON} data - Manga data.
 * @returns {String} Formated layout message for manga.
 */
const replyMangaInfo = data => {
    return `${replyMangaHeader(data)}\n*Description:*\n${verifyString(data.content.description)}\n\n\
*Genres:*\n${verifyObject(data.content.genres)}\n\n*Users*:\n${replyUsers(data.content.list_stats)}`;
}

/***********************************************************************************************************************
 *********************************************** REPLY ABOUT FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * This function edits the layout of Characters content.
 * @param {JSON} data - Characters Anilist info.
 * @returns {String} Info to be printed
 */
const replyAboutCharacters = data => {
    if(data) {
        return '*Characters:*\n'.concat(data.map(element => {
            const nameFirst = verifyEmptyString(element.name_first);
            const nameLast = verifyEmptyString(element.name_last);
            const name = verifyName(`${nameFirst} ${nameLast}`);
            const role = verifyRole(element.role);

            return `${name}${role}`;
        }).join('\n'));
    }

    else
        return '';
}

/**
 * This function edits the layout of Staff content.
 * @param {JSON} data - Staff Anilist info.
 * @returns {String} Info to be printed
 */
const replyAboutStaff = data => {
    if(data) {
        return '*Staff:*\n'.concat(data.map(element => {
            const nameFirst = verifyEmptyString(element.name_first);
            const nameLast = verifyEmptyString(element.name_last);
            const name = verifyName(`${nameFirst} ${nameLast}`);
            const role = verifyRole(element.role);

            return `${name}${role}`;
        }).join('\n'));
    }

    else
        return '';
}

/**
 * This function edits the layout of Studio content.
 * @param {JSON} data - Studio Anilist info.
 * @returns {String} Info to be printed
 */
const replyAboutStudio = data => {
    if(data) {
        return '*Studio:*\n'.concat(data.map(element => {
            return verifyMD('Name', element.studio_name);
        }).join(''));
    }

    else
        return '';
}

/**
 * This function returns info about Characters, Staff and Studio that made given anime.
 * @param {Boolean} notify - Wheter or not user want to receive notifications about the anime.  
 * @param {Boolean} content - Anilist anime data.
 * @returns {String} Content to be printed.
 */
const replyAboutAnime = ({notify, content}) => {
    return `${replyAnimeHeader({notify, content})}\n${replyAboutCharacters(content.characters)}\n\n\
${replyAboutStaff(content.staff)}\n\n${replyAboutStudio(content.studio)}`;
}

/**
 * This function returns info about Characters, Staff and Studio that made given manga.
 * @param {Boolean} notify - Wheter or not user want to receive notifications about the manga.  
 * @param {Boolean} content - Anilist manga data.
 * @returns {String} Content to be printed.
 */
const replyAboutManga = ({notify, content}) => {
    return `${replyMangaHeader({notify, content})}\n${replyAboutCharacters(content.characters)}\n\n\
${replyAboutStaff(content.staff)}\n\n${replyAboutStudio(content.studio)}`;
}

/***********************************************************************************************************************
 *********************************************** OTHER FUNCTIONS *******************************************************
 **********************************************************************************************************************/

/**
 * When  the  text  sent  to  a  button  is  too long, Telegram limits it to 200
 * characters, so there's a need to clean this up and make it more readble.
 * @param {string} string - String to be shortened.
 * @returns {string} Shortned version of string.
 */
const replyCallback = string => ('Not available' != string ) ? `${string.substring(0, string.lastIndexOf(' '))}...` : 'Not available';

/**
 * Set the data as button box message to info related about users.
 * @param {json} status - All the data about users.
 * @returns {string} Message to be printed.
 */
const replyUsers = status => {
    const completed = verifyButton('Completed', status.completed);
    const on_hold = verifyButton('On hold', status.on_hold);
    const dropped = verifyButton('Dropped', status.dropped);
    const to_watch = verifyButton('Plan to watch', status.plan_to_watch);
    const watching = verifyButton('Watching', status.watching);

    return `${completed}${on_hold}${dropped}${to_watch}${watching}`;
}

/**
 * Set the data as button box message to info related about the media.
 * @param {json} data - All the data about the media.
 * @returns {string} Message to be printed.
 */
const replyStatus = data => {
    const status = verifyButton('Status', data.airing_status);
    const episodes = verifyButton('Episodes', data.total_episodes);
    const popularity = verifyButton('Popularity', data.popularity);
    const start = verifyDate('Start date', data.start_date);
    const end = verifyDate('End date', data.end_date);

    return `${status}${episodes}${popularity}${start}${end}`;
}

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyAnimeNotify = data => {
    const japanese = verifyJPTitle(data.title_japanese);
    const english = verifyENTitle(data.title_english);
    const episodes = verifyEpisodes(data.total_episodes);
    const youtube = verifyYT(data.youtube_id);
    const adult = verifyAdult(data.adult);
    const type = verifyMD(data.type, data.series_type);
    const score = verifyScore(data.average_score);
    const watch = verifyWatchLink(data);
    const popularity = verifyMD('Popularity', data.popularity);
    const start = verifyDate('Start date', data.start_date);
    // Why  not  pass notify as argument??? Since the user is reciving a notification it's easy to assume that he wanted
    // to be notified
    const notifications = verifyMD('Notifications', 'Enabled');

    return `[\u200B](${data.image_url_lge})${line} NEW EPISODE - ${data.airing.next_episode-1} ${line}\n${japanese}\
${english}${youtube}${adult}${type}${score}${popularity}${start}${episodes}${notifications}${watch}`;
}

/**
 * Parse anime info from latest episode into a notification to the user.
 * @param {JSON} data- Anime content.
 * @returns An object containing the update message and buttons.
 */
const replyNotify = data => {
    return {
        message: replyAnimeNotify(data),
        keyboard: animeKeyboardWatchlist(data.id, 'all')
    };
}

/**
 * Set Anilist data converted to inline response on Telegram.
 * @param {string} type - What kind of content data represents
 * @param {json} data - Anilist data
 * @returns {json} Anilist data set in Telegram standards.
 */
const replyInline = (type, data) => {
    let dataTitle, messageText, keyboardMarkup, dataDescription, thumbUrl;

    switch(type) {
        case 'manga':
            dataTitle = `[MANGA] ${data.title_english}`;
            messageText = replyManga(data);
            keyboardMarkup = mangaKeyboardSearch(data.id).reply_markup;
            dataDescription = verifyString(data.description);
            thumbUrl = data.image_url_med;
            break;
        case 'anime':
            dataTitle = `[ANIME] ${data.title_english}`;
            messageText = replyAnime(data);
            keyboardMarkup = animeKeyboardSearch(data.id).reply_markup;
            dataDescription = verifyString(data.description);
            thumbUrl = data.image_url_med;
            break;
        case 'character':
            dataTitle = `[CHARACTER] ${data.name_first}`;
            messageText = replyCharacter(data);
            keyboardMarkup = characterKeyboard(data.id).reply_markup;
            dataDescription = verifyString(data.info);
            thumbUrl = data.image_url_lge;
            break;
        case 'staff':
            dataTitle = `[STAFF] ${data.name_first}`;
            messageText = replyStaff(data);
            keyboardMarkup = staffKeyboard(data.id, 'staff').reply_markup;
            dataDescription = verifyString(data.info);
            thumbUrl = data.image_url_lge;
            break;
        case 'studio':
            dataTitle = `[STUDIO] ${data.studio_name}`;
            messageText = replyStudio(data);
            keyboardMarkup = undefined;
            dataDescription = 'Not available';
            thumbUrl = logo_al;
            break
    }

    return {
        id: `${data.id}`,
        title: dataTitle,
        type: 'article',
        input_message_content: {
            message_text: messageText,
            parse_mode: 'Markdown',
        },
        reply_markup: keyboardMarkup,
        description: dataDescription,
        thumb_url: thumbUrl
    };
}

/**
 * Sets into Telegram layout the countdown to airing animes.
 * @param {JSON} data - Anilist data.
 * @param {Boolean} notify - Wheter or not user wants to be notifed about that anime.
 * @returns {JSON} Layout anime countdown.
 */
const replyCountdown = (data, notify) => {
    const japanese = verifyJPTitle(data.title_japanese);
    const english = verifyENTitle(data.title_english);
    const notifications = verifyMD('Notifications', (notify) ? 'Enabled' : 'Disabled');
    const countdown = verifyCountdown(data.airing.countdown);

    return `${japanese}${english}${notifications}${countdown}`;
}

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    replyCallback,
    replyUsers,
    replyStatus,
    replyBrowseAnime,
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
    replyBrowse,
    replyAboutAnime,
    replyAboutManga,
    replyCountdown
}
