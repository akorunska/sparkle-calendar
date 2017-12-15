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
        "/start -- see this message again\n" +
        "/echo -- repeat your message\n" +
        "/today -- see events for today\n" +
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

bot.onText(/echo (.+)/, function (msg, match) {
    let from_id = msg.from.id;
    let resp = match[1];
    bot.sendMessage(from_id, resp);
});

bot.onText(/\/today/, function (msg, match) {
    let resp = "";
    let from_id = msg.from.id;

    telegram_users.getUserByTelegramUsername(msg.from.username)
        .then(user => {
            if (user) {
                let date = moment();
                let search_date = (date.format()).substring(0, (date.format()).indexOf('T'));
                console.log(search_date);
                events.getByDate(user.user_id, search_date)
                    .then((events => {
                        console.log(events.length);
                        if (events.length > 0) {
                            bot.sendMessage(from_id, JSON.stringify(events));
                        } else {
                            resp = "You`ve nothing planned on this date";
                            bot.sendMessage(from_id, resp);
                        }
                    }))
                    .catch((err) => {
                        resp = "An error occurred, sorry.";
                        bot.sendMessage(from_id, resp);
                    })
            } else {
                resp = "Seems you`re not subscribed in the bot. Try running /start.";
                bot.sendMessage(from_id, resp);
            }
        })
        .catch((err) => {
            console.log(err);
            resp = "An error occurred, sorry.";
            bot.sendMessage(from_id, resp);
        });
});

bot.onText(/\/love/, function onLoveText(msg) {
    const opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
            'one_time_keyboard': true,
            keyboard: [
                ['Yes, you are the bot of my life ❤'],
                ['No, sorry there is another one...']
            ]
        })
    };

    bot.sendMessage(msg.from.id, 'Do you love me?', opts)
        .then(sent => {
            bot.onReplyToMessage(msg.from.id, sent.message_id, (response) => {
                if (response.text === "Yes, you are the bot of my life ❤") {
                    bot.sendMessage(msg.from.id, 'It is forever :3')
                }
            });
            bot.onText("Yes, you are the bot of my life ❤", () => {
                bot.sendMessage(msg.from.id, 'It is forever :3')
            });
        });

    // {
    //     "reply_markup": {
    //     "remove_keyboard": true
    // }
    // }
});

// bot.on('message', function (msg) {
//     let chat_id = msg.chat.id;
//     // Фотография может быть: путь к файлу, поток(stream) или параметр file_id
//     let photo = 'public/images/default.jpg';
//     bot.sendPhoto(chat_id, photo, {caption: 'You wanted a pic? Here you go.'});
// });