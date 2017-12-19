const express = require('express');
const router = express.Router();
const moment = require('moment');
const events = require('./../modules/events.js');
const users = require('./../modules/events.js');
const auth = require('./auth');

let basic_auth = auth.basic_auth;

router.get('/api/v1/user/events', basic_auth,
    async (req, res) => {
        let offset = (req.query.offset) ? (req.query.offset) : 0;
        let date = moment().add(offset, 'days');
        let display_date = date.format("dddd, MMMM Do YYYY");
        if (req.user) {
            let search_date = (date.format()).substring(0, (date.format()).indexOf('T'));
            events.getByDate(req.user.id, search_date)
                .then(data => {
                    let resp = {
                        events: data,
                        display_date: display_date
                    };
                    res.json(resp);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ message: "An error occurred, sorry."});
                });
        } else {
            res.status(401).json({ message: "Requires authentication"});
        }
    });

module.exports = router;