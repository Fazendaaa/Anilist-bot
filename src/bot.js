'use strict';

import dotenv from 'dotenv';
import Telegraf from 'telegraf';
import DB from './database';
import {
    welcome,
    help,
    notFound,
    removeCmd,
    cmdMessage,
    messageToString,
    notAnime,
    notCharacter,
    notStaff,
    notStudio,
    notQuery,
    notRm
} from './utils';
import {
    animeSearch,
    characterSearch,
    staffSearch,
    studioSearch,
    buttons,
    inlineSearch,
    watchlist
} from './base';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const db = new DB;
const parse = {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
}

bot.use(Telegraf.log());

bot.command('start', ctx => ctx.reply(welcome, {parse_mode:'Markdown'}));

bot.command('help', ctx => ctx.reply(help, {parse_mode:'Markdown'}));

bot.command('cmd', ctx => ctx.reply(cmdMessage, {parse_mode:'Markdown'}));

bot.command('source', ctx => ctx.reply('https://github.com/Fazendaaa/Anilist-bot', {parse_mode:'Markdown'}));

bot.command('anime', ctx => {
    const anime = messageToString(removeCmd(ctx));

    animeSearch(anime)
    .then(data => ctx.reply(data, {parse_mode:'Markdown'}))
    .catch(error => {
        console.log('[Error] /anime:', error);
        ctx.reply(notAnime, {parse_mode:'Markdown'});
    });
});

bot.command('character', ctx => {
    const character = messageToString(removeCmd(ctx));

    characterSearch(character)
    .then(data => ctx.reply(data, {parse_mode:'Markdown'}))
    .catch(error => {
        console.log('[Error] /character:', error);
        ctx.reply(notCharacter, {parse_mode:'Markdown'});
    });
});

bot.command('staff', ctx => {
    const staff = messageToString(removeCmd(ctx));

    staffSearch(staff)
    .then(data => ctx.reply(data, {parse_mode:'Markdown'}))
    .catch(error => {
        console.log('[Error] /staff:', error);
        ctx.reply(notStaff, {parse_mode:'Markdown'});
    });
});

bot.command('studio', ctx => {
    const studio = messageToString(removeCmd(ctx));

    studioSearch(studio)
    .then(data => ctx.reply(data, {parse_mode:'Markdown'}))
    .catch(error => {
        console.log('[Error] /studio:', error);
        ctx.reply(notStudio, {parse_mode:'Markdown'});
    });
});

bot.command('/watchlist', ctx => {
    const index = messageToString(removeCmd(ctx));
    const preview = (index) ? {parse_mode:'Markdown'} : parse;

    db.fetchAnimes(ctx.message.from.id)
        .then(data => {
            if('string' === typeof data)
                ctx.reply(data, {parse_mode:'Markdown'});
            else
                watchlist(data, index).then(response => {
                    if('object' === typeof response)
                        for(let i in response)
                            ctx.reply(response[i], {parse_mode:'Markdown'});
                    else
                        ctx.reply(response, preview);
                })
                .catch(error => {
                    console.log('[Error] /watchlist watchlist:', error);
                    ctx.reply(notQuery, {parse_mode:'Markdown'});
                });
        })
        .catch(error => {
            console.log('[Error] /watchlist:', error);
            ctx.reply(notQuery, {parse_mode:'Markdown'});
        });
});

bot.command('/rm', ctx => {
    const anime = messageToString(removeCmd(ctx));

    db.rmAnimes(ctx.message.from.id, anime)
        .then(data => {
            if('string' === typeof data)
                ctx.reply(data, {parse_mode:'Markdown'});
            else
                watchlist(data)
                    .then(response => ctx.reply(response, parse))
                    .catch(error => {
                        console.log('[Error] /rm watchlist:', error);
                        ctx.reply(notRm, {parse_mode:'Markdown'});
                    });
        }).catch(error => {
            console.log('[Error] /rm:', error);
            ctx.reply(notRm, {parse_mode:'Markdown'});
        });
});

bot.action(/.+/, ctx => {
    const result = ctx.match[0].split('/');

    buttons(db, ctx.from.id, result[0], result[1], result[2])
    .then(data => ctx.answerCallbackQuery(data, undefined, true))
    .catch(error => {
        console.log('[Error] answerCallbackQuery:', error);
        ctx.answerCallbackQuery('Not available', undefined, true);
    });
});

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
