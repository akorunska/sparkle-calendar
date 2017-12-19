const express = require('express');
const router = express.Router();
const moment = require('moment');
const events = require('./../modules/events.js');
const auth = require('./auth');

let checkAuth = auth.checkAuth;

router.get('/',
    (req,res) =>  {
        let event_list;
        let offset;
        if (req.query.offset)
            offset = req.query.offset;
        else
            offset = 0;
        let date = moment().add(offset, 'days');
        let display_date = date.format("dddd, MMMM Do YYYY");
        if (req.user) {
            let search_date = (date.format()).substring(0, (date.format()).indexOf('T'));
            events.getByDate(req.user.id, search_date)
                .then(data => {
                    event_list = data;
                    res.render('index', {user: req.user, date: display_date, event_list, offset});
                })
                .catch(err => {
                    console.log(err);
                    res.render('index', {user: req.user, date: display_date, event_list, offset});
                });
        } else {
            res.render('index', {user: req.user, date: display_date, event_list, offset});
        }
    });

router.get('/search',
    checkAuth, (req, res) => {
        let per_page = 6;
        let page = req.query.page || 1;
        let results = [];
        let url;
        if (req.query.page)
            url = req.originalUrl.substring(0, req.originalUrl.indexOf('&page='));
        else
            url = req.originalUrl;
        let auth_id = (req.user.role === 'admin') ? 'admin' : req.user.id;

        if (!req.query.parameter) {
            res.render('search',
                {   user: req.user,
                    results,
                    current: 0,
                    pages: 0,
                    q: "",
                    url,
                    moment
                });
        } else if (req.query.parameter === 'name') {
            events.searchByName(req.query.q, page, per_page, auth_id)
                .then (data => {
                    results = data;
                    events.countByName(req.query.q, auth_id)
                        .then(count => {
                            res.render('search',
                                {   user: req.user,
                                    results,
                                    current: page,
                                    pages: Math.ceil(count / per_page),
                                    q: req.query.q,
                                    url,
                                    moment
                                });
                        })
                        .catch(err => {
                            console.log(err);
                            res.sendStatus(500);
                        })
                })
                .catch(err => {
                    console.log(err);
                    res.sendStatus(500);
                });
        } else if (req.query.parameter === 'place') {
            events.searchByPlace(req.query.q, page, per_page, auth_id)
                .then (data => {
                    results = data;
                    events.countByPlace(req.query.q, auth_id)
                        .then(count => {
                            res.render('search',
                                {   user: req.user,
                                    results,
                                    current: page,
                                    pages: Math.ceil(count / per_page),
                                    q: req.query.q,
                                    url,
                                    moment
                                });
                        })
                        .catch(err => {
                            console.log(err);
                            res.sendStatus(500);
                        })
                })
                .catch(err => {
                    console.log(err);
                    res.sendStatus(500);
                });
        } else {
            res.sendStatus(400);
        }
    });

module.exports = router;