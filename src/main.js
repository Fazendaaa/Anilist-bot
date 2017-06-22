'use strict';

import Telegraf from 'telegraf';

import DB from './database';

import {
    Markup,
    menu,
    welcome,
    help,
    notFound,
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
    changeTime,
    setTimezone,
    notificationTime
} from './bot';

import {
    startKeyboard,
    locationKeyboard,
    menuKeyboard
} from './keyboard';

const bot = new Telegraf(process.env.BOT_TOKEN);
const db = new DB;
const parse = {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
};

/**
 * Starts up notification system.
 */
db.runNotify(); 

bot.use(Telegraf.log());
bot.use(Telegraf.memorySession());

/**
 * Introduction message.
 */
bot.command('start', ctx => {
    // Only to bot's chat
    if('private' == ctx.message.chat.type)
        ctx.reply(`We welcome you, *${ctx.message.from.username}* `.concat(welcome), startKeyboard());
    // To groups chats
    else
        ctx.reply('*This bot only works for searches in groups.*\nTo see more, chat with @ANILISTbot',
        {parse_mode: 'Markdown'});
});

/**
 * Searches animes given user query.
 */
bot.command('anime', ctx => {
    const anime = messageToString(removeCmd(ctx));
    animeSearch(anime)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

/**
 * Searches mangas given user query.
 */
bot.command('manga', ctx => {
    const manga = messageToString(removeCmd(ctx));

    mangaSearch(manga)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

/**
 * Searches characters given user query.
 */
bot.command('character', ctx => {
    const character = messageToString(removeCmd(ctx));

    characterSearch(character)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

/**
 * Searches staff given user query.
 */
bot.command('staff', ctx => {
    const staff = messageToString(removeCmd(ctx));

    staffSearch(staff)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

/**
 * Searches studios given user query.
 */
bot.command('studio', ctx => {
    const studio = messageToString(removeCmd(ctx));

    studioSearch(studio)
    .then(data => ctx.reply(data.message, data.keyboard))
    .catch(error => ctx.reply(`*${error.description}*`, {parse_mode:'Markdown'}));
});

/**
 * Handle buttons actions.
 */
bot.action(/.+/, ctx => {
    const message = (ctx.update.callback_query.hasOwnProperty('message')) ?
                     ctx.update.callback_query.message.message_id : undefined;
    const chat = (ctx.update.callback_query.hasOwnProperty('message')) ?
                  ctx.update.callback_query.message.chat.id : undefined;
    const user = ctx.update.callback_query.from.id;

    buttons(db, {message, user, chat, args: ctx.match[0]})
    .then(data => ctx.answerCallbackQuery(data.message, undefined, data.visualization))
    .catch(error => {
        console.log('[Error] answerCallbackQuery:', error);
        ctx.answerCallbackQuery('Not available', undefined, true);
    });
});

/**
 * Handles menu commands.
 */
bot.on('text', ctx => {
    const searchTimezone = 'Reply this message with the name, in English, of your city.';

    if('private' == ctx.message.chat.type) {
        // Verify if the user replied a message sent from the bot and user wants to search its city timezone.
        if(ctx.message.hasOwnProperty('reply_to_message') &&
           ctx.message.reply_to_message.from.id == process.env.BOT_ID &&
           ctx.message.reply_to_message.text == searchTimezone)
            setTimezone(db, ctx.message.from.id, ctx.message.text);

        else {
            switch(ctx.message.text) {
                case 'Menu':
                    // This will reset bot keyboard in case previously keyboard was to sent a location.
                    ctx.reply(`Hello, again, *${ctx.message.from.username}*`, startKeyboard()).then(() => {
                        ctx.reply(menu, menuKeyboard(ctx.message.from.id));
                    });
                    break;
                case 'Help':
                    ctx.reply(`How can I be helpful to you today, *${ctx.message.from.username}*?\n\n`.concat(help),
                    {parse_mode:'Markdown'});
                    break;
                case 'Change time for notifications':
                    ctx.reply("Okay, let's change only the time for your daily notifications.", startKeyboard());
                    notificationTime(db, ctx.message.from.id);
                    break;
                case 'Update location':
                    ctx.reply("Okay, let's change the timezone for notifications.", locationKeyboard());
                    break;
                case 'Search it':
                    ctx.reply("Okay, let's see what timezone you live in.", startKeyboard()).then(() => {
                        ctx.reply(searchTimezone, Markup.forceReply().extra());
                    });
                    break;
            }
        }
    }
})

/**
 * In case user sent location to be notified upon new episode releases.
 */
bot.on('location', ctx => {
    ctx.reply(`Now, *${ctx.message.from.username}*, let me help you set a time for your new updates.`, startKeyboard());
    changeTime(db, ctx.message.from.id, ctx.message.location);
});

/**
 * This is the handle @ANILISTbot inline searches.
 */
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
