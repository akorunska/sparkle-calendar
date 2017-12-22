const mongoose = require('mongoose');
const url = 'mongodb://admin:admin@ds159845.mlab.com:59845/sparkle';
const moment = require('moment');

mongoose.connect(url);

let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let eventSch = new Schema({
    name: String,
    place: String,
    date: String,
    start_time: String,
    end_time: String,
    author_id: String
   // notification: Boolean,
   // notification_time: String
});

eventSch.options.toJSON = {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

let Event = mongoose.model('Event', eventSch, 'events');

function create(event) {
    return new Promise(function (resolve, reject) {
        let newEvent = new Event ({
            name: event.name,
            place: event.place,
            date: event.date,
            start_time: event.start_time,
            end_time: event.end_time,
            author_id: event.author_id
            //notification: event.notification,
            //notification_time: event.notification_time
        });
        newEvent.save()
            .then(() => {
                resolve("successfuly created new event");
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getAll(author_id) {
    return new Promise(function (resolve, reject) {
        Event.find({author_id: author_id}, function (err, docs) {
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(docs)));
        });
    });
}

function getByDate(author_id, date) {
    return new Promise(function (resolve, reject) {
        Event.find({author_id: author_id, date: date}, function (err, docs) {
            if (err)
                reject(err);
        }).sort({start_time: 'asc'}).exec(function(err, docs) {
            if (err)
                reject(err);
            resolve(JSON.parse(JSON.stringify(docs)));
        });
    });
}

async function getWeekly(author_id, date) {
        let weekly = [7];
        for (let i = 0; i < 7; i++) {
            let cur = date.format().substring(0, (date.format()).indexOf('T'));
            weekly[i] = {
                date: date,
                display_date: date.format("dddd, MMMM Do YYYY"),
                event_list: await getByDate(author_id, cur)
            };
            date.add(1, 'days');
        }
    return (weekly);
}

function getById(event_id){
    return new Promise((resolve, reject) => {
       Event.findOne({_id: event_id}, function (err, docs) {
           if (err)
               reject (err);
           else if (!docs)
               reject ('no event with such id');
           else
               resolve(JSON.parse(JSON.stringify(docs)));
       })
    });
}

function searchByName(q, page, perPage, author_id) {
    let search_param = ".*" + q + '.*';
    let auth = (author_id === 'admin') ? new RegExp('.*') : author_id;

    return new Promise(((resolve, reject) => {
        Event
            .find({name: new RegExp(search_param), author_id: auth})
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec(function(err, docs) {
                if (err)
                    reject(err);
                else
                    resolve(JSON.parse(JSON.stringify(docs)));
            });
    }));
}

function countByName(q, author_id) {
    let search_param = ".*" + q + '.*';
    let auth = (author_id === 'admin') ? new RegExp('.*') : author_id;

    return new Promise(((resolve, reject) => {
        Event
            .find({name: new RegExp(search_param), author_id: auth})
            .count()
            .exec(function(err, res) {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
    }));
}

function searchByPlace(q, page, perPage, author_id) {
    let search_param = ".*" + q + '.*';
    let auth = (author_id === 'admin') ? new RegExp('.*') : author_id;

    return new Promise(((resolve, reject) => {
        Event
            .find({place: new RegExp(search_param), author_id: auth})
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec(function(err, docs) {
                if (err)
                    reject(err);
                else
                    resolve(JSON.parse(JSON.stringify(docs)));
            });
    }));
}

function countByPlace(q, author_id) {
    let search_param = ".*" + q + '.*';
    let auth = (author_id === 'admin') ? new RegExp('.*') : author_id;

    return new Promise(((resolve, reject) => {
        Event
            .find({place: new RegExp(search_param), author_id: auth})
            .count()
            .exec(function(err, res) {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
    }));
}


function remove(x_id) {
    return new Promise(function (resolve, reject) {
        Event.findById(x_id, function (err, event) {
            if (err)
                reject(err);
            if (!event)
                reject('no event with such id');
            event.remove();
            resolve("event deleted");
        });
    });
}

function update(event) {
    return new Promise(function (resolve, reject) {
        Event.findById(event.id, function (err, doc){
            if (err)
                reject(err);
            doc.name = event.name;
            doc.place = event.place;
            doc.date = event.date;
            doc.start_time = event.start_time;
            doc.end_time = event.end_time;
            doc.save();
            resolve("update successful");
        });
    });
}
//
// function getNotifications() {
//     return new Promise(((resolve, reject) => {
//         Event.find({notification: true}, function (err, docs) {
//             if (err)
//                 reject(err);
//             resolve(JSON.parse(JSON.stringify(docs)));
//         });
//     }));
// }


module.exports.create = create;
module.exports.getAll = getAll;
module.exports.getById = getById;
// module.exports.getNotifications = getNotifications;
module.exports.searchByName = searchByName;
module.exports.countByName = countByName;
module.exports.searchByPlace = searchByPlace;
module.exports.countByPlace = countByPlace;
module.exports.getByDate = getByDate;
module.exports.getWeekly = getWeekly;
module.exports.remove = remove;
module.exports.update = update;
