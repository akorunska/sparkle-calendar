let telegram_bot = require('node-telegram-bot-api');

let token = '471423777:AAFuKixbmlNxadC5qVnxh0TYXkDvuRnV6yU';
let bot = new telegram_bot(token, {polling: true});

bot.onText(/start/, function (msg) {
    let from_id = msg.from.id;
    console.log("id:" + from_id + "\n");
    console.log(msg.from);
    let resp =
        "Hello, " + msg.from.username +", I`m Sparkle Bot.\n" +
        "I can help you with notifications for your events on Sparkle Calendar\n" +
        "/start -- see this message again\n" +
        "/echo -- repeat your message\n" +
        "\n" +
        "If you`ve got any issues, questions or propositions, contact @augustusTertius";
    bot.sendMessage(from_id, resp);
});

bot.onText(/echo (.+)/, function (msg, match) {
    let from_id = msg.from.id;
    let resp = match[1];
    bot.sendMessage(from_id, resp);
});

// bot.on('message', function (msg) {
//     let chat_id = msg.chat.id;
//     // Фотография может быть: путь к файлу, поток(stream) или параметр file_id
//     let photo = 'public/images/default.jpg';
//     bot.sendPhoto(chat_id, photo, {caption: 'You wanted a pic? Here you go.'});
// });