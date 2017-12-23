const telegram_bot = require('node-telegram-bot-api');
const moment = require('moment');

let telegram_users = require('./modules/telegram_users.js');
let users = require('./modules/users.js');
let events = require('./modules/events.js');

let token = '471423777:AAFuKixbmlNxadC5qVnxh0TYXkDvuRnV6yU';

let bot = new telegram_bot(token, {polling: true});

let replies = [];

function addReply(ev_id, m_id, field) {
    replies.push({event_id: ev_id, message: m_id, field: field});
}

bot.onText(/\/start/, function (msg) {
    let from_id = msg.from.id;
    let resp = "ok";

    users.getUserByTelegramUsername(msg.from.username)
        .then(user => {

            if (user) {
                let to_cr ={ user_id: user.id, telegram: msg.from.username, chat_id: msg.from.id} ;
                telegram_users.create(to_cr)
                    .then(() => {
                        resp = "Great! Now you`re subscribed to my notifications.";
                        bot.sendMessage(from_id, resp);
                        showHelp(msg.from);
                    })
                    .catch((err) => {
                        console.log(err);
                        resp = "Seems like you`ve already been registered.";
                        bot.sendMessage(from_id, resp);
                        showHelp(msg.from);
                    });
            } else {
                resp = "No user on Sparkle with such Telegram username.";
                bot.sendMessage(from_id, resp);
            }
        })
        .catch(() => {
            resp = "An error occurred.";
            bot.sendMessage(from_id, resp);
        });
});

function showHelp(from) {
    let instr =
        "Hello, " + from.username +", I`m Sparkle Bot.\n" +
        "I can help you with your events on Sparkle Calendar\n" +
        "/start — register in Sparkle Bot\n" +
        "/help — see this message again\n" +
        "/today — see events for today\n" +
        "/date YYYY-MM-DD — see events for certain date\n" +
        "/weekday 2 — see events for certain day of the week starting from today\n" +
        "\n" +
        "If you`ve got any issues, questions or propositions, contact @augustusTertius";

    bot.sendMessage(from.id, instr);
}

bot.onText(/\/help/, function (msg) {
    showHelp(msg.from);
});

bot.onText(/\/today/, async function (msg) {
    let resp = "";
    let from_id = msg.from.id;
    let user;

    try {
        user = await telegram_users.getUserByTelegramUsername(msg.from.username);
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

bot.onText(/\/date(.*)/, async function (msg, match) {
    let resp = "";
    let from_id = msg.from.id;
    let user;

    try {
        user = await telegram_users.getUserByTelegramUsername(msg.from.username);
    } catch(e) {
        console.log(e);
        resp = "An error occurred, sorry.";
        bot.sendMessage(from_id, resp);
    }

    if (user) {
        if (!/\d{4}-\d{2}-\d{2}/.test(match[1].trim())) {
            resp = "Please specify data in format YYYY-MM-DD";
            bot.sendMessage(from_id, resp);
        } else {
            let date = moment(match[1].trim());
            if (!date.isValid()) {
                resp = "Date is invalid\nPlease specify date in format YYYY-MM-DD";
                bot.sendMessage(from_id, resp);
            } else {
                let search_date = (date.format()).substring(0, (date.format()).indexOf('T'));
                eventsForDate(user, from_id, search_date);
            }
        }
    } else {
        resp = "Seems you`re not subscribed in the bot. Try running /start.";
        bot.sendMessage(from_id, resp);
    }
});

bot.onText(/\/weekday(.*)/, async function (msg, match) {
    let resp = "";
    let from_id = msg.from.id;
    let user;

    try {
        user = await telegram_users.getUserByTelegramUsername(msg.from.username);
    } catch(e) {
        console.log(e);
        resp = "An error occurred, sorry.";
        bot.sendMessage(from_id, resp);
    }

    let day = parseInt(match[1]);
    if (user) {
        if (!/\d{1}/.test(match[1].trim()) && day >= 1 && day <= 7) {
            resp = "Please specify one digit from 1 to 7, where 1 is closest Monday, 7 is closest Sunday.";
            bot.sendMessage(from_id, resp);
        } else {
            let date = moment().weekday(day);
            if (date.isBefore(moment())) {
                date.add(7, 'd');
            }
            console.log(date);
            if (!date.isValid()) {
                resp = "Date is invalid\nPlease specify date in format YYYY-MM-DD";
                bot.sendMessage(from_id, resp);
            } else {
                let search_date = (date.format()).substring(0, (date.format()).indexOf('T'));
                eventsForDate(user, from_id, search_date);
            }
        }
    } else {
        resp = "Seems you`re not subscribed in the bot. Try running /start.";
        bot.sendMessage(from_id, resp);
    }
});

function dailyReplyMarkup(event_list) {
    let buttons = [];
    for (let ev of event_list) {
        let button = [
            {text: ev.name, callback_data: JSON.stringify({action: 'show', id: ev.id}) },
            {text: '✏', callback_data: JSON.stringify({action: 'more', id: ev.id}) }
        ];
        buttons.push(button);
    }

    return JSON.stringify({
            inline_keyboard: buttons,
            parse_mode: 'Markdown'});
}

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
        let options = {
            reply_markup: dailyReplyMarkup(event_list)
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
            [{text: 'edit event', callback_data: JSON.stringify({
                    action: 'req_edit',
                    id: event.id}) },
            {text: 'delete event', callback_data: JSON.stringify({
                    action: 'delete',
                    id: event.id})}]
        ];
        let options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                inline_keyboard: buttons,
                force_reply: true
            })
        };

        bot.deleteMessage(msg.from.id, msg.message.message_id);

        let resp = `What would you like to do with *${event.name}*?`;
        bot.sendMessage(msg.from.id, resp, options);
        bot.answerCallbackQuery(msg.id);
    } else if (input.action === 'delete') {
        let options = {
            parse_mode : "Markdown"
        };

        try {
            let event = await events.getById(input.id);
            await events.remove(input.id);
            bot.deleteMessage(msg.from.id, msg.message.message_id);
            // bot.deleteMessage(msg.from.id, input.orig);

            bot.editMessageReplyMarkup();

            bot.sendMessage(msg.from.id, `Event *${event.name}* was successfully deleted.`, options);
            bot.answerCallbackQuery(msg.id);
        } catch(e) {
            console.log(e);
            bot.sendMessage(msg.from.id, 'An error occurred.');
            bot.answerCallbackQuery(msg.id);
        }
    } else if (input.action === 'req_edit') {
        let event = await events.getById(input.id);

        let buttons = [
            [
                {text: 'name', callback_data: JSON.stringify({
                    action: 'edit_name',
                    id: event.id})
                },
                {text: 'place', callback_data: JSON.stringify({
                        action: 'edit_place',
                        id: event.id})
                },
                {text: 'date', callback_data: JSON.stringify({
                        action: 'edit_date',
                        id: event.id})
                }
            ],
            [
                {text: 'start time', callback_data: JSON.stringify({
                        action: 'edit_stime',
                        id: event.id})
                },
                {text: 'end time', callback_data: JSON.stringify({
                        action: 'edit_etime',
                        id: event.id})
                }
            ]
        ];

        let options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                inline_keyboard: buttons
            })
        };

        let resp = `Choose the field to edit in *${event.name}*?`;
        bot.deleteMessage(msg.from.id, msg.message.message_id);
        bot.sendMessage(msg.from.id, resp, options);
        bot.answerCallbackQuery(msg.id);
    } else if (input.action === 'edit_name') {
        let event = await events.getById(input.id);

        let options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                force_reply: true
            })
        };

        let resp = `Enter new name for ${event.name}`;
        bot.deleteMessage(msg.from.id, msg.message.message_id);

        let m = await bot.sendMessage(msg.from.id, resp, options);
        addReply(event.id, m.message_id, 'name');
        bot.answerCallbackQuery(msg.id);
    } else if (input.action === 'edit_place') {
        let event = await events.getById(input.id);

        let options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                force_reply: true
            })
        };

        let resp = `Enter new place for ${event.name}`;
        bot.deleteMessage(msg.from.id, msg.message.message_id);

        let m = await bot.sendMessage(msg.from.id, resp, options);
        addReply(event.id, m.message_id, 'place');
        bot.answerCallbackQuery(msg.id);
    } else if (input.action === 'edit_date') {
        let event = await events.getById(input.id);

        let options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                force_reply: true
            })
        };

        let resp = `Enter new date for ${event.name}`;
        bot.deleteMessage(msg.from.id, msg.message.message_id);

        let m = await bot.sendMessage(msg.from.id, resp, options);
        addReply(event.id, m.message_id, 'date');
        bot.answerCallbackQuery(msg.id);
    } else if (input.action === 'edit_stime') {
        let event = await events.getById(input.id);

        let options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                force_reply: true
            })
        };

        let resp = `Enter new name for ${event.name}`;
        bot.deleteMessage(msg.from.id, msg.message.message_id);

        let m = await bot.sendMessage(msg.from.id, resp, options);
        addReply(event.id, m.message_id, 'start_time');
        bot.answerCallbackQuery(msg.id);
    } else if (input.action === 'edit_etime') {
        let event = await events.getById(input.id);

        let options = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                force_reply: true
            })
        };

        let resp = `Enter new name for ${event.name}`;
        bot.deleteMessage(msg.from.id, msg.message.message_id);

        let m = await bot.sendMessage(msg.from.id, resp, options);
        addReply(event.id, m.message_id, 'end_time');
        bot.answerCallbackQuery(msg.id);
    }
});

bot.onText(/\/echo (.+)/, function (msg, match) {
    let from_id = msg.from.id;
    let resp = match[1];
    console.log(match[1]);
    bot.sendMessage(from_id, resp);
});

bot.onText(/(.*)/, async function (msg, match) {
    let id = msg.reply_to_message.message_id;

    if (id) {
       for (let i = 0; i < replies.length; i++) {
           if (replies[i].message === id) {
               let event = await events.getById(replies[i].event_id);
               let success = false;
               let new_ev = {
                   id: event.id,
                   name: event.name,
                   place: event.place,
                   date: event.date,
                   start_time: event.start_time,
                   end_time: event.end_time,
                   author_id: event.author_id
               };
               switch (replies[i].field) {
                   case ('name') :
                       new_ev.name = match[1].trim();
                       await events.update(new_ev);
                       bot.sendMessage(msg.from.id, 'Event name was updated');
                       success = true;
                       break;
                   case ('place') :
                       new_ev.place = match[1].trim();
                       await events.update(new_ev);
                       bot.sendMessage(msg.from.id, 'Event place was updated');
                       success = true;
                       break;
                   case ('date') :
                       let date = moment(match[1].trim());
                       if (!date.isValid()) {
                           resp = "Date is invalid\nPlease specify date in format YYYY-MM-DD";
                           bot.sendMessage(msg.from.id, resp);
                       } else {
                           new_ev.date = match[1].trim();
                           await events.update(new_ev);
                           bot.sendMessage(msg.from.id, 'Event date was updated');
                           success = true;
                       }
                       break;
                   case ('start_time') :
                       let t  = moment(match[1].trim());

                       if (!moment(event.date + "T" + t).isValid()) {
                           let resp = "Date is invalid\nPlease specify date in format hh:mm";
                           bot.sendMessage(msg.from.id, resp);
                       } else {
                           new_ev.start_time = match[1].trim();
                           await events.update(new_ev);
                           bot.sendMessage(msg.from.id, 'Event start time was updated');
                           success = true;
                       }
                       break;
                   case ('end_time') :
                       let time  = moment(match[1].trim());

                       if (!moment(event.date + "T" + time).isValid()) {
                           let resp = "Date is invalid\nPlease specify date in format hh:mm";
                           bot.sendMessage(msg.from.id, resp);
                       } else {
                           new_ev.end_time = match[1].trim();
                           await events.update(new_ev);
                           bot.sendMessage(msg.from.id, 'Event end time was updated');
                           success = true;
                       }
                       break;
               }

               if (success === true) {
                   let options = {
                       parse_mode : "Markdown"
                   };

                   let resp = `*${new_ev.name}*\n\n` +
                       `**Time**:  ${new_ev.start_time} - ${new_ev.end_time}; ${moment(new_ev.date).format("dddd, MMMM Do YYYY")}\n` +
                       `**Place**: ${new_ev.place}`;

                   bot.sendMessage(msg.from.id, resp, options);
               }
           }
       }

       bot.deleteMessage(msg.from.id, id);
       bot.deleteMessage(msg.from.id, msg.message_id);
   }
});

