const express = require('express');
const router = express.Router();
const events = require('./../modules/events.js');
const moment = require('moment');
const auth = require('./auth');

let checkAuth = auth.checkAuth;

router.get('/calendar/week',
    checkAuth, (req, res) => {
        let weekly_events;
        let offset;
        if (req.query.offset)
            offset = req.query.offset;
        else
            offset = 0;
        let start_date = moment().startOf('isoWeek').add(offset, 'weeks');
        let end_date = moment().startOf('isoWeek').add(offset, 'weeks').add(6, 'days');
        events.getWeekly(req.user.id, moment().startOf('isoWeek').add(offset, 'weeks'))
            .then(data => {
                weekly_events = data;
                res.render('calendar_week',
                    {user: req.user, moment, start_date, end_date, offset, weekly_events});
            })
            .catch(err => {
                console.log(err);
                res.render('calendar_week',
                    {user: req.user, moment, start_date, end_date, offset, weekly_events});
            });
    });

module.exports = router;