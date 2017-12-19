const express = require('express');
const router = express.Router();
const moment = require('moment');
const events = require('./../modules/events.js');
const auth = require('./auth');

let checkAuth = auth.checkAuth;
let checkAuthor = auth.checkAuthor;

router.get('/events/:guid([0-9a-z]*)',
    checkAuth,
    checkAuthor,
    (req, res) => {
        let event;
        let event_id = req.params.guid.trim();
        events.getById(event_id)
            .then (data => {
                event = data;
                res.render('event', {user: req.user, event, moment});
            })
            .catch(err => {
                console.log('error while receiving event:', err);
                res.sendStatus(404);
            });
    });

router.post('/event/:guid([0-9a-z]*)/delete',
    checkAuth,
    checkAuthor,
    (req, res) => {
        let event_id = req.params.guid.trim();
        console.log(event_id);
        events.remove(event_id)
            .then (() => {
                // let back_url = req.header('Referer') || '/';
                // res.redirect(back_url);
                res.redirect('/calendar/week');
            })
            .catch(err => {
                console.log('error while receiving event:', err);
                res.sendStatus(404);
            });
    });

router.get('/event/edit',
    checkAuth,
    checkAuthor,
    (req, res) => {
        events.getById(req.query.id)
            .then(data => {
                let event = data;
                res.render('edit_event', {user: req.user, event});
            })
            .catch(err => {
                console.log('failed to edit', req.query.id);
                console.log(err);
                res.redirect('/calendar/week');
            });
    });

router.post('/event/:guid([0-9a-z]*)/edit',
    checkAuth,
    checkAuthor,
    (req, res) => {
        let event = {
            id: req.params.guid,
            name: req.body.name,
            place: req.body.place,
            date: req.body.date,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            author_id: req.user.id
        };
        events.update(event)
            .catch(err => {
                console.log(err);
            });
        res.redirect('/events/' + event.id);
    });

module.exports = router;