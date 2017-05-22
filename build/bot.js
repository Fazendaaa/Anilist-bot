'use strict';

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _telegraf = require('telegraf');

var _telegraf2 = _interopRequireDefault(_telegraf);

var _database = require('./database');

var _database2 = _interopRequireDefault(_database);

var _utils = require('./utils');

var _base = require('./base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

const bot = new _telegraf2.default(process.env.BOT_TOKEN);
const db = new _database2.default();
const parse = {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
};

bot.use(_telegraf2.default.log());

bot.command('start', ctx => ctx.reply(_utils.welcome, { parse_mode: 'Markdown' }));

bot.command('help', ctx => ctx.reply(_utils.help, { parse_mode: 'Markdown' }));

bot.command('source', ctx => ctx.reply('https://github.com/Fazendaaa/Anilist-bot', { parse_mode: 'Markdown' }));

bot.command('anime', ctx => {
    const anime = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _base.animeSearch)(anime).then(data => ctx.reply(data, { parse_mode: 'Markdown' })).catch(error => {
        console.log('[Error] /anime:', error);
        ctx.reply('*Anime not found: do it again, please.*', { parse_mode: 'Markdown' });
    });
});

bot.command('character', ctx => {
    const character = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _base.characterSearch)(character).then(data => ctx.reply(data, { parse_mode: 'Markdown' })).catch(error => {
        console.log('[Error] /character:', error);
        ctx.reply('*Character not found: do it again, please.*', { parse_mode: 'Markdown' });
    });
});

bot.command('staff', ctx => {
    const staff = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _base.staffSearch)(staff).then(data => ctx.reply(data, { parse_mode: 'Markdown' })).catch(error => {
        console.log('[Error] /staff:', error);
        ctx.reply('*Staff not found: do it again, please.*', { parse_mode: 'Markdown' });
    });
});

bot.command('studio', ctx => {
    const studio = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    (0, _base.studioSearch)(studio).then(data => ctx.reply(data, { parse_mode: 'Markdown' })).catch(error => {
        console.log('[Error] /studio:', error);
        ctx.reply('*Studio not found: do it again, please.*', { parse_mode: 'Markdown' });
    });
});

bot.command('/watchlist', ctx => {
    const index = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));
    const preview = index ? { parse_mode: 'Markdown' } : parse;

    db.fetchAnimes(ctx.message.from.id).then(data => {
        if ('string' === typeof data) ctx.reply(data, { parse_mode: 'Markdown' });else (0, _base.watchlist)(data, index).then(response => {
            if ('object' === typeof response) for (let i in response) ctx.reply(response[i], { parse_mode: 'Markdown' });else ctx.reply(response, preview);
        }).catch(error => {
            console.log('[Error] /watchlist watchlist:', error);
            ctx.reply('*Could not query your data. Please, try it later.*', { parse_mode: 'Markdown' });
        });
    }).catch(error => {
        console.log('[Error] /watchlist:', error);
        ctx.reply('*Could not query your data. Please, try it later.*', { parse_mode: 'Markdown' });
    });
});

bot.command('/rm', ctx => {
    const anime = (0, _utils.messageToString)((0, _utils.removeCmd)(ctx));

    db.rmAnimes(ctx.message.from.id, anime).then(data => {
        if ('string' === typeof data) ctx.reply(data, { parse_mode: 'Markdown' });else (0, _base.watchlist)(data).then(response => ctx.reply(response, parse)).catch(error => error);
    }).catch(error => {
        console.log('[Error] /rm:', error);
        ctx.reply('*Could remove your data. Please, try it later.*', { parse_mode: 'Markdown' });
    });
});

bot.action(/.+/, ctx => {
    const result = ctx.match[0].split('/');

    (0, _base.buttons)(db, ctx.from.id, result[0], result[1], result[2]).then(data => ctx.answerCallbackQuery(data, undefined, true)).catch(error => {
        console.log('[Error] answerCallbackQuery:', error);
        ctx.answerCallbackQuery('Not available', undefined, true);
    });
});

bot.on('inline_query', ctx => {
    const query = (0, _utils.messageToString)(ctx.inlineQuery.query) || '';

    (0, _base.inlineSearch)(query).then(data => ctx.answerInlineQuery(data)).catch(error => {
        console.log('[Error] inline_query:', error);
        ctx.answerInlineQuery([_utils.notFound]);
    });
});

bot.startPolling();