const express = require('express');
const router = express.Router();
const events = require('./../modules/events.js');
const auth = require('./auth');
const moment = require('moment');

let checkAuth = auth.checkAuth;

router.get('/add_event.js', checkAuth, (req, res) => {
    let date = (moment().format()).substring(0, (moment().format()).indexOf('T'));
    res.render('add_event.js', {user: req.user, date});
});

router.post('/add_event.js',
    checkAuth, (req, res) => {
        let event = {
            author_id: req.user.id,
            name: req.body.name,
            place: req.body.place,
            date: req.body.date,
            start_time: req.body.start_time,
            end_time: req.body.end_time
        };
        events.create(event)
            .catch(err => console.log('error while creating event:', err));
        res.redirect('/');
    });

module.exports = router;