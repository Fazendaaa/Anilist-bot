'use strict';

var _verify = require('./verify');

var _keyboard = require('./keyboard');

var _utils = require('./utils');

/***********************************************************************************************************************
 ********************************************** REPLY BROWSE FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * Set the anime browse data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyBrowseAnime = data => {
    const japanese = (0, _verify.verifyJPTitle)(data.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.title_english);
    const type = (0, _verify.verifyMD)(data.series_type, data.type);
    const start = (0, _verify.verifyDate)('Start date', data.start_date);
    const end = (0, _verify.verifyDate)('End date', data.end_date);
    const status = (0, _verify.verifyMD)('Status', data.airing_status);
    const popularity = (0, _verify.verifyMD)('Popularity', data.popularity);
    const score = (0, _verify.verifyScore)(data.average_score);
    const episodes = (0, _verify.verifyEpisodes)(data.total_episodes);

    /*  \u200B is the invisible emoji   */
    return `[\u200B](${data.image_url_lge})${japanese}${english}${type}${score}${status}${episodes}${popularity}${start}${end}`;
};

/**
 * Set the manga browse data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyBrowseManga = data => {
    const japanese = (0, _verify.verifyJPTitle)(data.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.title_english);
    const type = (0, _verify.verifyMD)(data.series_type, data.type);
    const start = (0, _verify.verifyDate)('Start date', data.start_date);
    const end = (0, _verify.verifyDate)('End date', data.end_date);
    const status = (0, _verify.verifyMD)('Status', data.publishing_status);
    const popularity = (0, _verify.verifyMD)('Popularity', data.popularity);
    const score = (0, _verify.verifyScore)(data.average_score);
    const volumes = (0, _verify.verifyVolumes)(data.total_volumes);
    const chapters = (0, _verify.verifyChapters)(data.total_chapters);

    return `[\u200B](${data.image_url_lge})${japanese}${english}${type}${score}${status}${volumes}${chapters}\
${popularity}${start}${end}`;
};

/**
 * Set Anilist data converted to inline browse response on Telegram.
 * @param {string} type - What kind of content data represents
 * @param {json} data - Anilist data
 * @returns {json} Anilist data set in Telegram standards.
 */
const replyBrowse = (type, data) => {
    let dataId, dataTitle, messageText, keyboardMarkup, dataDescription, thumbUrl;

    switch (type) {
        case 'manga':
            dataTitle = `[MANGA] ${data.title_english}`;
            messageText = replyBrowseManga(data);
            keyboardMarkup = (0, _keyboard.mangaKeyboardSearch)(data.id).reply_markup;
            thumbUrl = data.image_url_med;
            break;
        case 'anime':
            dataTitle = `[ANIME] ${data.title_english}`;
            messageText = replyBrowseAnime(data);
            keyboardMarkup = (0, _keyboard.animeKeyboardSearch)(data.id).reply_markup;
            thumbUrl = data.image_url_med;
            break;
        case 'character':
            dataTitle = `[CHARACTER] ${data.name_first}`;
            messageText = replyBrowseCharacter(data);
            keyboardMarkup = (0, _keyboard.characterKeyboard)(data.id).reply_markup;
            thumbUrl = data.image_url_lge;
            break;
        case 'staff':
            dataTitle = `[STAFF] ${data.name_first}`;
            messageText = replyBrowseStaff(data);
            keyboardMarkup = (0, _keyboard.staffKeyboard)(data.id, 'staff').reply_markup;
            thumbUrl = data.image_url_lge;
            break;
        case 'studio':
            dataTitle = `[STUDIO] ${data.studio_name}`;
            messageText = replyBrowseStudio(data);
            keyboardMarkup = undefined;
            thumbUrl = _utils.logo_al;
            break;
    }

    return {
        id: `${data.id}`,
        title: dataTitle,
        type: 'article',
        input_message_content: {
            message_text: messageText,
            parse_mode: 'Markdown'
        },
        reply_markup: keyboardMarkup,
        description: 'Browse content: for more info about, select it.',
        thumb_url: thumbUrl
    };
};

/***********************************************************************************************************************
 ************************************************ REPLY KIND FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyManga = data => {
    const japanese = (0, _verify.verifyJPTitle)(data.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.title_english);
    const youtube = (0, _verify.verifyYT)(data.youtube_id);
    const adult = (0, _verify.verifyAdult)(data.adult);
    const type = (0, _verify.verifyMD)(data.type, data.series_type);
    const score = (0, _verify.verifyScore)(data.average_score);
    const status = (0, _verify.verifyMD)('Status', data.publishing_status);
    const volumes = (0, _verify.verifyVolumes)(data.total_volumes);
    const chapters = (0, _verify.verifyChapters)(data.total_chapters);
    const popularity = (0, _verify.verifyMD)('Popularity', data.popularity);
    const start = (0, _verify.verifyDate)('Start date', data.start_date);
    const end = (0, _verify.verifyDate)('End date', data.end_date);

    return `[\u200B](${data.image_url_lge})${japanese}${english}${youtube}${adult}${type}${score}${status}${volumes}\
${chapters}${popularity}${start}${end}`;
};

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyAnime = data => {
    const japanese = (0, _verify.verifyJPTitle)(data.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.title_english);
    const youtube = (0, _verify.verifyYT)(data.youtube_id);
    const adult = (0, _verify.verifyAdult)(data.adult);
    const type = (0, _verify.verifyMD)(data.type, data.series_type);
    const score = (0, _verify.verifyScore)(data.average_score);
    const status = (0, _verify.verifyMD)('Status', data.airing_status);
    const episodes = (0, _verify.verifyEpisodes)(data.total_episodes);
    const popularity = (0, _verify.verifyMD)('Popularity', data.popularity);
    const start = (0, _verify.verifyDate)('Start date', data.start_date);
    const end = (0, _verify.verifyDate)('End date', data.end_date);

    return `[\u200B](${data.image_url_lge})${japanese}${english}${youtube}${adult}${type}${score}${status}${episodes}\
${popularity}${start}${end}`;
};

/**
 * Set the character data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyCharacter = data => {
    const firstName = (0, _verify.verifyEmptyString)(data.name_first);
    const lastName = (0, _verify.verifyEmptyString)(data.name_last);
    const japanese = (0, _verify.verifyJPTitle)(data.name_japanese);
    const english = (0, _verify.verifyENTitle)(`${firstName} ${lastName}`);

    return `[\u200B](${data.image_url_lge})${japanese}${english}`;
};

/**
 * Set the staff data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyStaff = data => {
    const japaneseFirst = (0, _verify.verifyEmptyString)(data.name_first_japanese);
    const japaneseLast = (0, _verify.verifyEmptyString)(data.name_last_japanese);
    const englishFirst = (0, _verify.verifyEmptyString)(data.name_first);
    const englishLast = (0, _verify.verifyEmptyString)(data.name_last);
    const japanese = (0, _verify.verifyJPTitle)(`${japaneseFirst} ${japaneseLast}`);
    const english = (0, _verify.verifyENTitle)(`${englishFirst} ${englishLast}`);
    const language = (0, _verify.verifyMD)('Language', data.language);
    const website = (0, _verify.verifyWS)(data.website);

    return `[\u200B](${data.image_url_lge})${japanese}${english}${language}${website}`;
};

/**
 * Set the studio data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyStudio = data => {
    const name = (0, _verify.verifyTitle)(data.studio_name);
    const website = (0, _verify.verifyWS)(data.studio_wiki);

    return `[\u200B](${_utils.logo_al})${name}${website}`;
};

/***********************************************************************************************************************
 ************************************************ REPLY LIST FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyMangaReadlist = data => {
    const japanese = (0, _verify.verifyJPTitle)(data.content.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.content.title_english);
    const youtube = (0, _verify.verifyYT)(data.content.youtube_id);
    const adult = (0, _verify.verifyAdult)(data.content.adult);
    const type = (0, _verify.verifyMD)(data.content.type, data.content.series_type);
    const score = (0, _verify.verifyScore)(data.content.average_score);
    const status = (0, _verify.verifyMD)('Status', data.content.publishing_status);
    const volumes = (0, _verify.verifyVolumes)(data.content.total_volumes);
    const chapters = (0, _verify.verifyChapters)(data.content.total_chapters);
    const popularity = (0, _verify.verifyMD)('Popularity', data.content.popularity);
    const start = (0, _verify.verifyDate)('Start date', data.content.start_date);
    const end = (0, _verify.verifyDate)('End date', data.content.end_date);

    return `[\u200B](${data.content.image_url_lge})${japanese}${english}${youtube}${adult}${type}${score}${status}${volumes}\
${chapters}${popularity}${start}${end}`;
};

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} content - Bot modified Anilist data.
 * @returns {string} Message to be printed.
 */
const replyAnimeWatchlist = data => {
    // console.log(data);
    const japanese = (0, _verify.verifyJPTitle)(data.content.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.content.title_english);
    const youtube = (0, _verify.verifyYT)(data.content.youtube_id);
    const adult = (0, _verify.verifyAdult)(data.content.adult);
    const type = (0, _verify.verifyMD)(data.content.type, data.content.series_type);
    const score = (0, _verify.verifyScore)(data.content.average_score);
    const status = (0, _verify.verifyMD)('Status', data.content.airing_status);
    const episodes = (0, _verify.verifyEpisodes)(data.content.total_episodes);
    const popularity = (0, _verify.verifyMD)('Popularity', data.content.popularity);
    const start = (0, _verify.verifyDate)('Start date', data.content.start_date);
    const end = (0, _verify.verifyDate)('End date', data.content.end_date);
    const notifications = (0, _verify.verifyMD)('Notifications', data.notify ? 'Enabled' : 'Disabled');
    const next = (0, _verify.verifyNextEpisode)(data.content.airing);
    const watch = (0, _verify.verifyWatchLink)(data.content);

    return `[\u200B](${data.content.image_url_lge})${japanese}${english}${youtube}${adult}${type}${score}${status}${episodes}\
${popularity}${start}${end}${notifications}${next}${watch}`;
};

/**
 * Put in a preview layout about the user list data.
 * @param {Number} index - Postion of anime in list.
 * @param {Number} data - Contet.
 * @returns List preview info.
 */
const replyList = (index, data) => {
    const japanese = (0, _verify.verifyJPTitle)(data.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.title_english);
    const youtube = (0, _verify.verifyYT)(data.youtube_id);
    const adult = (0, _verify.verifyAdult)(data.adult);

    return `${_utils.line}\t${index}\t${_utils.line}\n${japanese}${english}${youtube}${adult}`;
};

/***********************************************************************************************************************
 *********************************************** REPLY HEADER FUNCTIONS ************************************************
 **********************************************************************************************************************/

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyAnimeHeader = data => {
    const japanese = (0, _verify.verifyJPTitle)(data.content.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.content.title_english);
    const youtube = (0, _verify.verifyYT)(data.content.youtube_id);
    const adult = (0, _verify.verifyAdult)(data.content.adult);
    const type = (0, _verify.verifyMD)(data.content.type, data.content.series_type);
    const notifications = (0, _verify.verifyMD)('Notifications', data.notify ? 'Enabled' : 'Disabled');

    return `[\u200B](${data.content.image_url_lge})${japanese}${english}${youtube}${adult}${type}${notifications}`;
};

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyMangaHeader = data => {
    const japanese = (0, _verify.verifyJPTitle)(data.content.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.content.title_english);
    const youtube = (0, _verify.verifyYT)(data.content.youtube_id);
    const adult = (0, _verify.verifyAdult)(data.content.adult);
    const type = (0, _verify.verifyMD)(data.content.type, data.content.series_type);

    return `[\u200B](${data.content.image_url_lge})${japanese}${english}${youtube}${adult}${type}`;
};

/***********************************************************************************************************************
 ************************************************ REPLY INFO FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * This function is to set a new layout about anime info in watchlist.
 * @param {JSON} data - Anime data.
 * @returns {String} Formated layout message for anime.
 */
const replyAnimeInfo = data => {
    return `${replyAnimeHeader(data)}\n*Description:*\n${(0, _verify.verifyString)(data.content.description)}\n\n\
*Genres:*\n${(0, _verify.verifyObject)(data.content.genres)}\n\n*Users*:\n${replyUsers(data.content.list_stats)}`;
};

/**
 * This function is to set a new layout about manga info in watchlist.
 * @param {JSON} data - Manga data.
 * @returns {String} Formated layout message for manga.
 */
const replyMangaInfo = data => {
    return `${replyMangaHeader(data)}\n*Description:*\n${(0, _verify.verifyString)(data.content.description)}\n\n\
*Genres:*\n${(0, _verify.verifyObject)(data.content.genres)}\n\n*Users*:\n${replyUsers(data.content.list_stats)}`;
};

/***********************************************************************************************************************
 *********************************************** REPLY ABOUT FUNCTIONS *************************************************
 **********************************************************************************************************************/

/**
 * This function edits the layout of Characters content.
 * @param {JSON} data - Characters Anilist info.
 * @returns {String} Info to be printed
 */
const replyAboutCharacters = data => {
    if (data) {
        return '*Characters:*\n'.concat(data.map(element => {
            const nameFirst = (0, _verify.verifyEmptyString)(element.name_first);
            const nameLast = (0, _verify.verifyEmptyString)(element.name_last);
            const name = (0, _verify.verifyName)(`${nameFirst} ${nameLast}`);
            const role = (0, _verify.verifyRole)(element.role);

            return `${name}${role}`;
        }).join('\n'));
    } else return '';
};

/**
 * This function edits the layout of Staff content.
 * @param {JSON} data - Staff Anilist info.
 * @returns {String} Info to be printed
 */
const replyAboutStaff = data => {
    if (data) {
        return '*Staff:*\n'.concat(data.map(element => {
            const nameFirst = (0, _verify.verifyEmptyString)(element.name_first);
            const nameLast = (0, _verify.verifyEmptyString)(element.name_last);
            const name = (0, _verify.verifyName)(`${nameFirst} ${nameLast}`);
            const role = (0, _verify.verifyRole)(element.role);

            return `${name}${role}`;
        }).join('\n'));
    } else return '';
};

/**
 * This function edits the layout of Studio content.
 * @param {JSON} data - Studio Anilist info.
 * @returns {String} Info to be printed
 */
const replyAboutStudio = data => {
    if (data) {
        return '*Studio:*\n'.concat(data.map(element => {
            return (0, _verify.verifyMD)('Name', element.studio_name);
        }).join(''));
    } else return '';
};

/**
 * This function returns info about Characters, Staff and Studio that made given anime.
 * @param {Boolean} notify - Wheter or not user want to receive notifications about the anime.  
 * @param {Boolean} content - Anilist anime data.
 * @returns {String} Content to be printed.
 */
const replyAboutAnime = (_ref) => {
    let notify = _ref.notify,
        content = _ref.content;

    return `${replyAnimeHeader({ notify: notify, content: content })}\n${replyAboutCharacters(content.characters)}\n\n\
${replyAboutStaff(content.staff)}\n\n${replyAboutStudio(content.studio)}`;
};

/**
 * This function returns info about Characters, Staff and Studio that made given manga.
 * @param {Boolean} notify - Wheter or not user want to receive notifications about the manga.  
 * @param {Boolean} content - Anilist manga data.
 * @returns {String} Content to be printed.
 */
const replyAboutManga = (_ref2) => {
    let notify = _ref2.notify,
        content = _ref2.content;

    return `${replyMangaHeader({ notify: notify, content: content })}\n${replyAboutCharacters(content.characters)}\n\n\
${replyAboutStaff(content.staff)}\n\n${replyAboutStudio(content.studio)}`;
};

/***********************************************************************************************************************
 *********************************************** OTHER FUNCTIONS *******************************************************
 **********************************************************************************************************************/

/**
 * When  the  text  sent  to  a  button  is  too long, Telegram limits it to 200
 * characters, so there's a need to clean this up and make it more readble.
 * @param {string} string - String to be shortened.
 * @returns {string} Shortned version of string.
 */
const replyCallback = string => 'Not available' != string ? `${string.substring(0, string.lastIndexOf(' '))}...` : 'Not available';

/**
 * Set the data as button box message to info related about users.
 * @param {json} status - All the data about users.
 * @returns {string} Message to be printed.
 */
const replyUsers = status => {
    const completed = (0, _verify.verifyButton)('Completed', status.completed);
    const on_hold = (0, _verify.verifyButton)('On hold', status.on_hold);
    const dropped = (0, _verify.verifyButton)('Dropped', status.dropped);
    const to_watch = (0, _verify.verifyButton)('Plan to watch', status.plan_to_watch);
    const watching = (0, _verify.verifyButton)('Watching', status.watching);

    return `${completed}${on_hold}${dropped}${to_watch}${watching}`;
};

/**
 * Set the data as button box message to info related about the media.
 * @param {json} data - All the data about the media.
 * @returns {string} Message to be printed.
 */
const replyStatus = data => {
    const status = (0, _verify.verifyButton)('Status', data.airing_status);
    const episodes = (0, _verify.verifyButton)('Episodes', data.total_episodes);
    const popularity = (0, _verify.verifyButton)('Popularity', data.popularity);
    const start = (0, _verify.verifyDate)('Start date', data.start_date);
    const end = (0, _verify.verifyDate)('End date', data.end_date);

    return `${status}${episodes}${popularity}${start}${end}`;
};

/**
 * Set the anime data to be a telegram message with the message layout.
 * @param {json} data - Anilist data
 * @returns {string} Message to be printed.
 */
const replyAnimeNotify = data => {
    const japanese = (0, _verify.verifyJPTitle)(data.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.title_english);
    const episodes = (0, _verify.verifyEpisodes)(data.total_episodes);
    const youtube = (0, _verify.verifyYT)(data.youtube_id);
    const adult = (0, _verify.verifyAdult)(data.adult);
    const type = (0, _verify.verifyMD)(data.type, data.series_type);
    const score = (0, _verify.verifyScore)(data.average_score);
    const watch = (0, _verify.verifyWatchLink)(data);
    const popularity = (0, _verify.verifyMD)('Popularity', data.popularity);
    const start = (0, _verify.verifyDate)('Start date', data.start_date);
    // Why  not  pass notify as argument??? Since the user is reciving a notification it's easy to assume that he wanted
    // to be notified
    const notifications = (0, _verify.verifyMD)('Notifications', 'Enabled');

    return `[\u200B](${data.image_url_lge})${_utils.line} NEW EPISODE - ${data.airing.next_episode - 1} ${_utils.line}\n${japanese}\
${english}${youtube}${adult}${type}${score}${popularity}${start}${episodes}${notifications}${watch}`;
};

/**
 * Parse anime info from latest episode into a notification to the user.
 * @param {JSON} data- Anime content.
 * @returns An object containing the update message and buttons.
 */
const replyNotify = data => {
    return {
        message: replyAnimeNotify(data),
        keyboard: (0, _keyboard.animeKeyboardWatchlist)(data.id, 'all')
    };
};

/**
 * Set Anilist data converted to inline response on Telegram.
 * @param {string} type - What kind of content data represents
 * @param {json} data - Anilist data
 * @returns {json} Anilist data set in Telegram standards.
 */
const replyInline = (type, data) => {
    let dataTitle, messageText, keyboardMarkup, dataDescription, thumbUrl;

    switch (type) {
        case 'manga':
            dataTitle = `[MANGA] ${data.title_english}`;
            messageText = replyManga(data);
            keyboardMarkup = (0, _keyboard.mangaKeyboardSearch)(data.id).reply_markup;
            dataDescription = (0, _verify.verifyString)(data.description);
            thumbUrl = data.image_url_med;
            break;
        case 'anime':
            dataTitle = `[ANIME] ${data.title_english}`;
            messageText = replyAnime(data);
            keyboardMarkup = (0, _keyboard.animeKeyboardSearch)(data.id).reply_markup;
            dataDescription = (0, _verify.verifyString)(data.description);
            thumbUrl = data.image_url_med;
            break;
        case 'character':
            dataTitle = `[CHARACTER] ${data.name_first}`;
            messageText = replyCharacter(data);
            keyboardMarkup = (0, _keyboard.characterKeyboard)(data.id).reply_markup;
            dataDescription = (0, _verify.verifyString)(data.info);
            thumbUrl = data.image_url_lge;
            break;
        case 'staff':
            dataTitle = `[STAFF] ${data.name_first}`;
            messageText = replyStaff(data);
            keyboardMarkup = (0, _keyboard.staffKeyboard)(data.id, 'staff').reply_markup;
            dataDescription = (0, _verify.verifyString)(data.info);
            thumbUrl = data.image_url_lge;
            break;
        case 'studio':
            dataTitle = `[STUDIO] ${data.studio_name}`;
            messageText = replyStudio(data);
            keyboardMarkup = undefined;
            dataDescription = 'Not available';
            thumbUrl = _utils.logo_al;
            break;
    }

    return {
        id: `${data.id}`,
        title: dataTitle,
        type: 'article',
        input_message_content: {
            message_text: messageText,
            parse_mode: 'Markdown'
        },
        reply_markup: keyboardMarkup,
        description: dataDescription,
        thumb_url: thumbUrl
    };
};

/**
 * Sets into Telegram layout the countdown to airing animes.
 * @param {JSON} data - Anilist data.
 * @param {Boolean} notify - Wheter or not user wants to be notifed about that anime.
 * @returns {JSON} Layout anime countdown.
 */
const replyCountdown = (data, notify) => {
    const japanese = (0, _verify.verifyJPTitle)(data.title_japanese);
    const english = (0, _verify.verifyENTitle)(data.title_english);
    const notifications = (0, _verify.verifyMD)('Notifications', notify ? 'Enabled' : 'Disabled');
    const countdown = (0, _verify.verifyCountdown)(data.airing.countdown);

    return `${japanese}${english}${notifications}${countdown}`;
};

/***********************************************************************************************************************
 **************************************************** EXPORTS **********************************************************
 **********************************************************************************************************************/

module.exports = {
    replyCallback: replyCallback,
    replyUsers: replyUsers,
    replyStatus: replyStatus,
    replyBrowseAnime: replyBrowseAnime,
    replyAnime: replyAnime,
    replyManga: replyManga,
    replyAnimeInfo: replyAnimeInfo,
    replyMangaInfo: replyMangaInfo,
    replyMangaReadlist: replyMangaReadlist,
    replyAnimeWatchlist: replyAnimeWatchlist,
    replyCharacter: replyCharacter,
    replyStaff: replyStaff,
    replyStudio: replyStudio,
    replyList: replyList,
    replyAnimeNotify: replyAnimeNotify,
    replyNotify: replyNotify,
    replyInline: replyInline,
    replyBrowse: replyBrowse,
    replyAboutAnime: replyAboutAnime,
    replyAboutManga: replyAboutManga,
    replyCountdown: replyCountdown
};