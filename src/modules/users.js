const mongoose = require('mongoose');
const url = 'mongodb://admin:admin@ds159845.mlab.com:59845/sparkle';
mongoose.connect(url);

let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let userSch = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: String,
    fullname: String,
    profile_pic: String,
    email: String,
    telegram: String
});

userSch.options.toJSON = {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

let User = mongoose.model('User', userSch, 'users');

function create(user) {
    return new Promise(function (resolve, reject) {
        let newUser = new User ({
            username: user.username,
            password: user.password,
            role: user.role,
            profile_pic: user.profile_pic
        });
        if (user.email)
            newUser.email = user.email;
        if (user.telegram)
            newUser.telegram = user.telegram;

        newUser.save()
            .then(() => {
                resolve("successfuly created new user");
            })
            .catch(err => {
                reject(err);
            });
    });
}

function update(user) {
    return new Promise(function (resolve, reject)  {
        User.findById(user.id, function (err, doc){
            if (err)
                reject(err);
            doc.profile_pic = user.profile_pic;
            doc.email = user.email;
            doc.telegram = user.telegram;
            doc.fullname = user.fullname;
            doc.save();
            resolve("update successful");
        });
    });
}

function getUserByLoginAndPasshash(username, password) {
    return new Promise(function (resolve, reject) {
        User.findOne({username: username, password: password}, (err, docs) => {
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(docs)));
        })
    });
}

function getUserById(id) {
    return new Promise(function (resolve, reject) {
        User.findById(id, function (err, user){
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(user)));
        } );
    });
}

function getUserByTelegramUsername(username) {
    return new Promise(function (resolve, reject) {
        let q = '@' + username;
        User.findOne({telegram: q}, function (err, user){
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(user)));
        } );
    });
}

function getAll() {
    return new Promise(function (resolve, reject) {
        User.find({ }, function (err, docs) {
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(docs)));
        });
    });
}

module.exports.create = create;
module.exports.update = update;
module.exports.getUserByLoginAndPasshash = getUserByLoginAndPasshash;
module.exports.getUserById = getUserById;
module.exports.getUserByTelegramUsername = getUserByTelegramUsername;
module.exports.getAll = getAll;