const express = require('express');
const router = express.Router();
const moment = require('moment');
const events = require('./../modules/events.js');
const users = require('./../modules/users.js');
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

router.get('/api/v1/taken',
    async (req, res) => {
        // let users = await users.getAll();
        if (req.query.username) {
            let found = await users.getUserByUsername(req.query.username);
            if (found) {
                res.json({res: true});
            } else {
                res.json({res: false});
            }
        } else if (req.query.telegram) {
            let found = await users.getUserByTelegramUsername(req.query.telegram);
            if (found) {
                res.json({res: true});
            } else {
                res.json({res: false});
            }
        } else if (req.query.email) {
            let found = await users.getUserByEmail(req.query.email);
            if (found) {
                res.json({res: true});
            } else {
                res.json({res: false});
            }
        } else {
            res.status(400).json({ message: "Requires one of parameters: username, telegram or email."});
        }
    });

module.exports = router;