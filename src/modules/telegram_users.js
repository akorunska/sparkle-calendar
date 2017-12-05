const mongoose = require('mongoose');
const url = 'mongodb://admin:admin@ds159845.mlab.com:59845/sparkle';
mongoose.connect(url);

let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let telegram_userSch = new Schema({
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

let Telegram_user = mongoose.model('User', telegram_userSch, 'telegram_users');

function create(user) {
    return new Promise(function (resolve, reject) {
        let t_user = new Telegram_user({
            telegram: user.telegram,
            chat_id: user.chat_id
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

module.exports.create = create;