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

db.runNotify();
bot.use(_telegraf2.default.log());
bot.use(_telegraf2.default.memorySession());

bot.command('start', ctx => ctx.reply(`We welcome you, *${ctx.message.from.username}* `.concat(_utils.welcome), (0, _keyboard.startKeyboard)()));

bot.command('source', ctx => ctx.reply(_utils.source, { parse_mode: 'Markdown', disable_web_page_preview: true }));

bot.command('notifications', ctx => {
    db.toggleNotifications(ctx.message.from.id).then(data => {
        const message = data ? '*Notifications enabled*' : '*Notifications disabled, to enable again just type:* /notifications';
        ctx.reply(message, { parse_mode: 'Markdown' });
    });
});

bot.command('anime', ctx => {
    const anime = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));
    (0, _search.animeSearch)(anime).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

bot.command('manga', ctx => {
    const manga = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _search.mangaSearch)(manga).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

bot.command('character', ctx => {
    const character = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _search.characterSearch)(character).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

bot.command('staff', ctx => {
    const staff = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _search.staffSearch)(staff).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

bot.command('studio', ctx => {
    const studio = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _search.studioSearch)(studio).then(data => ctx.reply(data.message, data.keyboard)).catch(error => ctx.reply(`*${error.description}*`, { parse_mode: 'Markdown' }));
});

bot.action(/.+/, ctx => {
    const message = ctx.update.callback_query.hasOwnProperty('message') ? ctx.update.callback_query.message.message_id : undefined;
    const chat = ctx.update.callback_query.hasOwnProperty('message') ? ctx.update.callback_query.message.chat.id : undefined;
    const user = ctx.update.callback_query.from.id;

    (0, _bot.buttons)(db, { message: message, user: user, chat: chat, args: ctx.match[0] }).then(data => ctx.answerCallbackQuery(data.message, undefined, data.visualization)).catch(error => {
        console.log('[Error] answerCallbackQuery:', error);
        ctx.answerCallbackQuery('Not available', undefined, true);
    });
});

bot.on('text', ctx => {
    const user = ctx.message.from.id;

    // Verify if the user replied a message sent from the bot.
    if (ctx.message.hasOwnProperty('reply_to_message') && ctx.message.reply_to_message.from.id == process.env.BOT_ID) {
        // Just verify wheter user replied to a valide message.
        try {
            const lines = ctx.message.reply_to_message.text.split('\n');
            (0, _bot.list)(db, { user: user, index: ctx.message.text, header: lines[0].split(' ')[1], kind: lines[1].split(' ')[1] }).then(response => {
                response.forEach(element => {
                    ctx.reply(element.message, element.keyboard);
                });
            }).catch(error => {
                console.log('[Error] text reply:', error);
                ctx.reply(_utils.notQuery, { parse_mode: 'Markdown' });
            });
        } catch (error) {
            ctx.reply('*Invalid reply message*', { parse_mode: 'Markdown' });
        }
    } else if ('Menu' == ctx.message.text) ctx.reply(`Hello, again, *${ctx.message.from.username}*\n\n`.concat(_utils.menu), (0, _keyboard.menuKeyboard)(ctx.message.from.id));else if ('Help' == ctx.message.text) ctx.reply(`How can I be helpful to you today, *${ctx.message.from.username}*?\n\n`.concat(_utils.help), { parse_mode: 'Markdown' });
});

bot.on('inline_query', ctx => {
    const query = (0, _utils.messageToString)(ctx.inlineQuery.query) || '';

    (0, _search.inlineSearch)(query).then(data => ctx.answerInlineQuery(data)).catch(error => {
        console.log('[Error] inline_query:', error);
        ctx.answerInlineQuery([_utils.notFound]);
    });
});

bot.startPolling();