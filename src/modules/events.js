const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/lab6';
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
    // return new Promise(function (resolve, reject) {
        let weekly = [7];
        // date = moment.parse(date);
        for (let i = 0; i < 7; i++) {
            let cur = date.format().substring(0, (date.format()).indexOf('T'));
            // await (Event.find({author_id: author_id, date: cur}, function (err, docs) {})
            //     .sort({start_time: 'asc'}));
            weekly[i] = {date: date, event_list: await getByDate(author_id, cur)};
            date.add(1, 'days');
        }
    return (weekly);
}

function getById(x_id) {
    return new Promise(function (resolve, reject) {
        Event.findById(x_id, function (err, event){
            if (err)
                reject(err);
            if (!event)
                reject('no event wiht such id');
            resolve(JSON.parse(JSON.stringify(event)));
        } );
    });
}

function remove(x_id) {
    return new Promise(function (resolve, reject) {
        Event.findById(x_id, function (err, event) {
            if (err)
                reject(err);
            if (!event)
                reject('no event wiht such id');
            event.remove();
            resolve("event deleted");
        } );
    });
}


module.exports.create = create;
module.exports.getAll = getAll;
module.exports.getById = getById;
module.exports.getByDate = getByDate;
module.exports.getWeekly = getWeekly;
module.exports.remove = remove;
