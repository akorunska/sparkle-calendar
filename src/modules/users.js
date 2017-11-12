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
    role: String
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
            role: user.role
        });

        newUser.save()
            .then(() => {
                resolve("successfuly created new user");
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getUserByLoginAndPasshash(username, password) {
    return new Promise(function (resolve, reject) {
        User.findOne({username: username, password: password}, (err, docs) => {
            if (err)
                reject(err);
            if (docs)
                console.log("found a user we're searching for");
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
module.exports.getUserByLoginAndPasshash = getUserByLoginAndPasshash;
module.exports.getUserById = getUserById;
module.exports.getAll = getAll;