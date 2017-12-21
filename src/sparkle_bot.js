const telegram_bot = require('node-telegram-bot-api');
const moment = require('moment');

let telegram_users = require('./modules/telegram_users.js');
let users = require('./modules/users.js');
let events = require('./modules/events.js');

let token = '471423777:AAFuKixbmlNxadC5qVnxh0TYXkDvuRnV6yU';

let bot = new telegram_bot(token, {polling: true});

bot.onText(/\/start/, function (msg) {
    let from_id = msg.from.id;
    let resp = "ok";
    let instr =
        "Hello, " + msg.from.username +", I`m Sparkle Bot.\n" +
        "I can help you with notifications for your events on Sparkle Calendar\n" +
        "/start — see this message again\n" +
        "/today — see events for today\n" +
        "\n" +
        "If you`ve got any issues, questions or propositions, contact @augustusTertius";

    users.getUserByTelegramUsername(msg.from.username)
        .then(user => {

            if (user) {
                let to_cr ={ user_id: user.id, telegram: msg.from.username, chat_id: msg.from.id} ;
                telegram_users.create(to_cr)
                    .then(() => {
                        resp = "Great! Now you`re subscribed to my notifications.";
                        bot.sendMessage(from_id, resp);
                        bot.sendMessage(from_id, instr);
                    })
                    .catch((err) => {
                        console.log(err);
                        resp = "Seems like you`ve already been registered.";
                        bot.sendMessage(from_id, resp);
                        bot.sendMessage(from_id, instr);
                    });
            } else {
                resp = "No user on Sparkle with such Telegram username.";
                bot.sendMessage(from_id, resp);
            }
        })
        .catch(() => {
            resp = "No user on Sparkle with such Telegram username.";
            bot.sendMessage(from_id, resp);
        });
});

bot.onText(/\/today/, async function (msg) {
    let resp = "";
    let from_id = msg.from.id;
    let user;

    try {
        user = await telegram_users.getUserByTelegramUsername(msg.from.username);
        console.log(user);
    } catch(e) {
        console.log(e);
        resp = "An error occurred, sorry.";
        bot.sendMessage(from_id, resp);
    }

    if (user) {
        let date = moment();
        let search_date = (date.format()).substring(0, (date.format()).indexOf('T'));
        eventsForDate(user, from_id, search_date);
    } else {
        resp = "Seems you`re not subscribed in the bot. Try running /start.";
        bot.sendMessage(from_id, resp);
    }
});

async function eventsForDate(user, from_id, search_date) {
    let event_list;

    try {
       event_list = await events.getByDate(user.user_id, search_date);
    } catch(e) {
        console.log(e);
        resp = "An error occurred, sorry.";
        bot.sendMessage(from_id, resp);
    }

    if (event_list.length > 0) {
        let buttons = [];
        for (let ev of event_list) {
            let info = {
                action: 'show',
                id: ev.id,
            };
            let info_data = JSON.stringify(info);
            let button = [
                {text: ev.name, callback_data: JSON.stringify({action: 'show', id: ev.id}) },
                {text: '✏', callback_data: JSON.stringify({action: 'more', id: ev.id}) }
            ];
            buttons.push(button);
        }

        let options = {
            reply_markup: JSON.stringify({
                inline_keyboard: buttons,
                parse_mode: 'Markdown'
            })
        };

        bot.sendMessage(from_id, 'Here are your events for ' + search_date, options);
    } else {
        resp = "You`ve got nothing planned on " + search_date;
        bot.sendMessage(from_id, resp);
    }
}

bot.on('callback_query', async function (msg) {
    let input = JSON.parse(msg.data);

    if (input.action === 'show') {
        let event = await events.getById(input.id);
        let options = {
            parse_mode : "Markdown"
        };

        let resp = `*${event.name}*\n\n` +
        `**Time**:  ${event.start_time} - ${event.end_time}; ${moment(event.date).format("dddd, MMMM Do YYYY")}\n` +
        `**Place**: ${event.place}`;

        bot.sendMessage(msg.from.id, resp, options);
        bot.answerCallbackQuery(msg.id);
    } else if (input.action === 'more') {
        let event = await events.getById(input.id);

        let buttons = [
            [{text: 'edit event', callback_data: JSON.stringify({action: 'edit', id: event.id}) },
            {text: 'delete event', callback_data: JSON.stringify({action: 'delete', id: event.id}) }]
        ];
        let options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                inline_keyboard: buttons,
            })
        };
        let resp = `What would you like to do with *${event.name}*?`;
        bot.sendMessage(msg.from.id, resp, options);
        bot.answerCallbackQuery(msg.id);
    }
});

bot.onText(/\/echo (.+)/, function (msg, match) {
    let from_id = msg.from.id;
    let resp = match[1];
    console.log(match[1]);
    bot.sendMessage(from_id, resp);
});