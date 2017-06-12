'use strict';

var _telegraf = require('telegraf');

var _telegraf2 = _interopRequireDefault(_telegraf);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

const bot = new _telegraf2.default(process.env.BOT_TOKEN);

bot.use(_telegraf2.default.log());

/*
bot.command('onetime', ({ reply }) =>
  reply('One time keyboard', Markup
    .keyboard(['/simple', '/inline', '/pyramid'])
    .oneTime()
    .resize()
    .extra()
  )
)
bot.command('custom', ({ reply }) => {
  return reply('Custom buttons keyboard', Markup
    .keyboard([
      ['🔍 Search', '😎 Popular'],         // Row1 with 2 buttons
      ['☸ Setting', '📞 Feedback'],       // Row2 with 2 buttons
      ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
    ])
    .oneTime()
    .resize()
    .extra()
  )
})
*/
bot.command('special', ctx => {
  return ctx.reply('Special buttons keyboard', _telegraf.Extra.markup(markup => {
    return markup.resize().keyboard([markup.contactRequestButton('Send contact'), markup.locationRequestButton('Send location')]);
  }));
});

bot.command('pyramid', ctx => {
  return ctx.reply('Keyboard wrap', _telegraf.Extra.markup(_telegraf.Markup.keyboard(['one', 'two', 'three', 'four', 'five', 'six'], {
    wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2
  })));
});

bot.command('simple', ctx => {
  return ctx.replyWithHTML('<b>Coke</b> or <i>Pepsi?</i>', _telegraf.Extra.markup(_telegraf.Markup.keyboard(['Coke', 'Pepsi'])));
});

bot.command('inline', ctx => {
  return ctx.reply('<b>Coke</b> or <i>Pepsi?</i>', _telegraf.Extra.HTML().markup(m => m.inlineKeyboard([m.callbackButton('Coke', 'Coke'), m.callbackButton('Pepsi', 'Pepsi')])));
});

bot.command('random', ctx => {
  return ctx.reply('random example', _telegraf.Markup.inlineKeyboard([_telegraf.Markup.callbackButton('Coke', 'Coke'), _telegraf.Markup.callbackButton('Dr Pepper', 'Dr Pepper', Math.random() > 0.5), _telegraf.Markup.callbackButton('Pepsi', 'Pepsi')]).extra());
});

bot.hears(/\/wrap (\d+)/, ctx => {
  return ctx.reply('Keyboard wrap', _telegraf.Extra.markup(_telegraf.Markup.keyboard(['one', 'two', 'three', 'four', 'five', 'six'], {
    columns: parseInt(ctx.match[1])
  })));
});

bot.action('Dr Pepper', (ctx, next) => {
  return ctx.reply('👍').then(next);
});

bot.action(/.+/, ctx => {
  return ctx.answerCallbackQuery(`Oh, ${ctx.match[0]}! Great choise`);
});

bot.startPolling();