const express = require('express');
const router = express.Router();
const config = require('./../modules/config');
const serverSalt = config.salt;
const passport = require('passport');
const crypto = require('crypto');
const basicAuth = require('basic-auth');

const users = require('./../modules/users.js');
const events = require('./../modules/events.js');

function checkAuth(req, res, next) {
    if (!req.user) return res.redirect('/login');
    next();
}

function checkAuthor(req, res, next) {
    if (req.user.role === 'admin')
        next();
    else {
        let event_id;
        if (req.params.guid)
            event_id = req.params.guid;
        else
            event_id = req.query.id;
        events.getById(event_id)
            .then(event => {
                if(event.author_id !== req.user.id)
                    res.redirect('/login');
            })
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
        next();
    }
}

function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
}

function basic_auth(req, res, next) {
    let n_user = basicAuth(req);
    if (n_user && n_user.name && n_user.pass) {
        let hash = sha512(n_user.pass, serverSalt).passwordHash;
        users.getUserByLoginAndPasshash(n_user.name, hash)
            .then (res_user => {
                req.user = res_user;
                next();
            })
            .catch (() => {
                next();
            });
    } else {
        next();
    }
}

router.get('/sign_up',
    (req, res) => {
        res.render('sign_up', {user: req.user});
    });

router.post('/sign_up', (req, res) => {
    let user = {
        username: req.body.username,
        password: sha512(req.body.password, serverSalt).passwordHash,
        email: req.body.email,
        telegram: req.body.telegram,
        role: 'user',
        profile_pic: '/images/default.jpg'
    };
    console.log("going to create: ", user);
    users.create(user)
        .then (() => {
            res.redirect('/login');
        })
        .catch(err => {
            console.log('could not create user:', err);
            res.redirect('/sign_up');
        });
});

router.get('/login', (req, res) =>  {
    res.render('login', {user: req.user});
});


router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

router.get('/logout',
    checkAuth, (req, res) => {
        req.logout();
        res.redirect('/');
    });


module.exports = router;
module.exports.checkAuth = checkAuth;
module.exports.checkAuthor = checkAuthor;
module.exports.basic_auth = basic_auth;