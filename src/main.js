'use strict';

import Telegraf from 'telegraf';

import DB from './database';

import {
    menu,
    welcome,
    help,
    notFound,
    source,
    removeCmd,
    messageToString,
    notQuery,
} from './utils';

import {
    mangaPage,
    animeID,
    characterID,
    staffID,
    studioID,
    animeSearch,
    characterSearch,
    staffSearch,
    studioSearch,
    mangaSearch,
    inlineSearch
} from './search';

import {
    buttons,
    list
} from './bot';

import {
    startKeyboard,
    menuKeyboard
} from './keyboard';

const bot = new Telegraf(process.env.BOT_TOKEN);
const db = new DB;
const parse = {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
};

db.runNotify(); 
bot.use(Telegraf.log());
bot.use(Telegraf.memorySession());

bot.command('menu', ctx => {
    ctx.reply('*This option is no longer available.*\nType: /start to update to a new version and use Keyboard only.', {parse_mode: 'Markdown'});
});

bot.command('help', ctx => {
    ctx.reply('*This option is no longer available.*\nType: /start to update to a new version and use Keyboard only.', {parse_mode: 'Markdown'});
});

bot.command('start', ctx => {
    // Only to bot's chat
    if(ctx.message.from.id == ctx.message.chat.id)
        ctx.reply(`We welcome you, *${ctx.message.from.username}* `.concat(welcome), startKeyboard());
    // To user chats
    else
        ctx.reply('*This bot only works for searches in groups.*\nTo see more, chat with @ANILISTbot', {parse_mode: 'Markdown'});
});

bot.command('source', ctx => ctx.reply(source, {parse_mode:'Markdown', disable_web_page_preview: true}));

bot.command('notifications', ctx => {
    db.toggleNotifications(ctx.message.from.id).then(data => {
        const message = (data) ? '*Notifications enabled*' : '*Notifications disabled, to enable again just type:* /notifications';
        ctx.reply(message, {parse_mode:'Markdown'});
    });
});

bot.command('anime', ctx => {
    const anime = messageToString(removeCmd(ctx));
    animeSearch(anime)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

bot.command('manga', ctx => {
    const manga = messageToString(removeCmd(ctx));

    mangaSearch(manga)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

bot.command('character', ctx => {
    const character = messageToString(removeCmd(ctx));

    characterSearch(character)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

bot.command('staff', ctx => {
    const staff = messageToString(removeCmd(ctx));

    staffSearch(staff)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

bot.command('studio', ctx => {
    const studio = messageToString(removeCmd(ctx));

    studioSearch(studio)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

bot.action(/.+/, ctx => {
    const message = (ctx.update.callback_query.hasOwnProperty('message')) ? ctx.update.callback_query.message.message_id : undefined;
    const chat = (ctx.update.callback_query.hasOwnProperty('message')) ? ctx.update.callback_query.message.chat.id : undefined;
    const user = ctx.update.callback_query.from.id;

    buttons(db, {message, user, chat, args: ctx.match[0]})
    .then(data => ctx.answerCallbackQuery(data.message, undefined, data.visualization))
    .catch(error => {
        console.log('[Error] answerCallbackQuery:', error);
        ctx.answerCallbackQuery('Not available', undefined, true);
    });
});

bot.on('text', (ctx) => {
    const user = ctx.message.from.id;

    // Verify if the user replied a message sent from the bot.
    if(ctx.message.hasOwnProperty('reply_to_message') && ctx.message.reply_to_message.from.id == process.env.BOT_ID) {
        // Just verify wheter user replied to a valide message.
        try {
            const lines = ctx.message.reply_to_message.text.split('\n');
            list(db, {user, index: ctx.message.text, header: lines[0].split(' ')[1], kind: lines[1].split(' ')[1]}).then(response => {
                response.forEach(element => {
                    ctx.reply(element.message, element.keyboard);
                });
            }).catch(error => {
                console.log('[Error] text reply:', error);
                ctx.reply(notQuery, {parse_mode:'Markdown'});
            });
        }
        catch(error) {
            ctx.reply('*Invalid reply message*', {parse_mode: 'Markdown'});
        }
    }

    else if('Menu' == ctx.message.text)
        ctx.reply(`Hello, again, *${ctx.message.from.username}*\n\n`.concat(menu), menuKeyboard(ctx.message.from.id));

    else if('Help' == ctx.message.text)
        ctx.reply(`How can I be helpful to you today, *${ctx.message.from.username}*?\n\n`.concat(help), {parse_mode:'Markdown'});
})

bot.on('inline_query', ctx => {
    const query = messageToString(ctx.inlineQuery.query) || '';

    inlineSearch(query)
    .then(data => ctx.answerInlineQuery(data))
    .catch(error => {
        console.log('[Error] inline_query:', error)
        ctx.answerInlineQuery([notFound]);
    });
});

bot.startPolling();
