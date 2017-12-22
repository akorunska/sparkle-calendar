const mongoose = require('mongoose');
const url = 'mongodb://admin:admin@ds159845.mlab.com:59845/sparkle';
mongoose.connect(url);

let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let telegram_userSch = new Schema({
    user_id: {
        type: String,
        unique: true,
        required: true
    },
    telegram: {
        type: String,
        unique: true,
        required: true
    },
    chat_id: {
        type: String,
        unique: true,
        required: true
    }
});

telegram_userSch.options.toJSON = {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

let Telegram_user = mongoose.model('Telegram_user', telegram_userSch, 'telegram_users');

function create(user) {
    return new Promise(function (resolve, reject) {
        console.log(user);
        let t_user = new Telegram_user({
            telegram: '@' + user.telegram,
            chat_id: user.chat_id,
            user_id: user.user_id
        });

        t_user.save()
            .then(() => {
                resolve("successfuly created new user");
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getUserByTelegramUsername(username) {
    return new Promise(function (resolve, reject) {
        let q = '@' + username;
        Telegram_user.findOne({telegram: q}, function (err, user){
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(user)));
        } );
    });
}

function getUserByUserId(user_id) {
    return new Promise(function (resolve, reject) {
        Telegram_user.findOne({user: user_id}, function (err, user){
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(user)));
        } );
    });
}

module.exports.create = create;
module.exports.getUserByTelegramUsername = getUserByTelegramUsername;
module.exports.getUserByUserId = getUserByUserId;