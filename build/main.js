'use strict';

var _telegraf = require('telegraf');

var _telegraf2 = _interopRequireDefault(_telegraf);

var _database = require('./database');

var _database2 = _interopRequireDefault(_database);

var _utils = require('./utils');

var _search = require('./search');

var _bot = require('./bot');

var _keyboard = require('./keyboard');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bot = new _telegraf2.default(process.env.BOT_TOKEN);
const db = new _database2.default();
const parse = {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
};

/**
 * Starts up notification system.
 */
db.runNotify();

bot.use(_telegraf2.default.log());
bot.use(_telegraf2.default.memorySession());

/**
 * Handles grup/supergroup requests
 */
bot.telegram.getMe().then(botInfo => {
    bot.options.username = botInfo.username;
});

/**
 * Introduction message.
 */
bot.command('start', ctx => {
    // Only to bot's chat
    if ('private' == ctx.message.chat.type) ctx.reply(`We welcome you, *${ctx.message.from.username}* `.concat(_utils.welcome), (0, _keyboard.startKeyboard)());
    // To groups chats
    else ctx.reply('*This bot only works for searches in groups.*\nTo see more, chat with @ANILISTbot', { parse_mode: 'Markdown' });
});

/**
 * Searches animes given user query.
 */
bot.command('anime', ctx => {
    const anime = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));
    (0, _search.animeSearch)(anime).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

/**
 * Searches mangas given user query.
 */
bot.command('manga', ctx => {
    const manga = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _search.mangaSearch)(manga).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

/**
 * Searches characters given user query.
 */
bot.command('character', ctx => {
    const character = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _search.characterSearch)(character).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

/**
 * Searches staff given user query.
 */
bot.command('staff', ctx => {
    const staff = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _search.staffSearch)(staff).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

/**
 * Searches studios given user query.
 */
bot.command('studio', ctx => {
    const studio = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _search.studioSearch)(studio).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

/**
 * Handle buttons actions.
 */
bot.action(/.+/, ctx => {
    const message = ctx.update.callback_query.hasOwnProperty('message') ? ctx.update.callback_query.message.message_id : undefined;
    const chat = ctx.update.callback_query.hasOwnProperty('message') ? ctx.update.callback_query.message.chat.id : undefined;
    const user = ctx.update.callback_query.from.id;

    (0, _bot.buttons)(db, { message: message, user: user, chat: chat, args: ctx.match[0] }).then(data => ctx.answerCallbackQuery(data.message, undefined, data.visualization)).catch(error => {
        console.log('[Error] answerCallbackQuery:', error);
        ctx.answerCallbackQuery('Not available', undefined, true);
    });
});

/**
 * Handles menu commands.
 */
bot.on('text', ctx => {
    const searchTimezone = 'Reply this message with the name, in English, of your city.';

    if ('private' == ctx.message.chat.type) {
        // Verify if the user replied a message sent from the bot and user wants to search its city timezone.
        if (ctx.message.hasOwnProperty('reply_to_message') && ctx.message.reply_to_message.from.id == process.env.BOT_ID && ctx.message.reply_to_message.text == searchTimezone) (0, _bot.setTimezone)(db, ctx.message.from.id, ctx.message.text);else {
            switch (ctx.message.text) {
                case 'Menu':
                    // This will reset bot keyboard in case previously keyboard was to sent a location.
                    ctx.reply(`Hello, again, *${ctx.message.from.username}*`, (0, _keyboard.startKeyboard)()).then(() => {
                        ctx.reply(_utils.menu, (0, _keyboard.menuKeyboard)(ctx.message.from.id));
                    });
                    break;
                case 'Help':
                    ctx.reply(`How can I be helpful to you today, *${ctx.message.from.username}*?\n\n`.concat(_utils.help), { parse_mode: 'Markdown' });
                    break;
                case 'Change time for notifications':
                    ctx.reply("Okay, let's change only the time for your daily notifications.", (0, _keyboard.startKeyboard)());
                    (0, _bot.notificationTime)(db, ctx.message.from.id);
                    break;
                case 'Update location':
                    ctx.reply("Okay, let's change the timezone for notifications.", (0, _keyboard.locationKeyboard)());
                    break;
                case 'Search it':
                    ctx.reply("Okay, let's see what timezone you live in.", (0, _keyboard.startKeyboard)()).then(() => {
                        ctx.reply(searchTimezone, _utils.Markup.forceReply().extra());
                    });
                    break;
            }
        }
    }
});

/**
 * In case user sent location to be notified upon new episode releases.
 */
bot.on('location', ctx => {
    ctx.reply(`Now, *${ctx.message.from.username}*, let me help you set a time for your new updates.`, (0, _keyboard.startKeyboard)());
    (0, _bot.changeTime)(db, ctx.message.from.id, ctx.message.location);
});

/**
 * This is the handle @ANILISTbot inline searches.
 */
bot.on('inline_query', ctx => {
    const pageLimit = 20;
    const offset = parseInt(ctx.inlineQuery.offset) || 0;
    const query = (0, _utils.messageToString)(ctx.inlineQuery.query) || '';

    (0, _search.inlineSearch)(query, offset, pageLimit).then(data => {
        if (data) ctx.answerInlineQuery(data, { next_offset: offset + pageLimit });else ctx.answerInlineQuery([_utils.notFound]);
    }).catch(error => {
        console.log('[Error] inline_query:', error);
        ctx.answerInlineQuery([_utils.notFound]);
    });
});

bot.startPolling();