const users = require('./modules/users.js');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const multer = require('multer');
const app = express();
let config = require('./modules/config');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// let upload = multer({dest: 'public/images/' });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'SEGReT$25_',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const serverSalt = "45%sAlT_";

function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
}

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
    }, function (username, password, done) {
        let hash = sha512(password, serverSalt).passwordHash;
        users.getUserByLoginAndPasshash(username, hash)
            .then(user => {
                console.log(user);
                done(user ? null : 'No user', user);
            })
            .catch(err => {
                console.log(err);
            });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    users.getUserById(id)
        .then(user => {
            done(user ? null : 'No user', user);
        })
        .catch(err => {
            console.log(err);
        });
});

function checkAuth(req, res, next) {
    if (!req.user) return res.sendStatus(401);
    next();
}

function checkAuthor(req, res, next) {
    events.getById(req.params.guid)
        .then(event => {
        if(req.params.guid !== req.user.id)
    res.sendStatus(401);
})
.catch(err => {
        res.sendStatus(500);
});
    next();
}

app.get('/',
    (req,res) => res.render('index', {user: req.user}));

app.get('/sign_up',
    (req, res) => {
    res.render('sign_up', {user: req.user});
});

app.post('/sign_up', (req, res) => {
    console.log(req.body);
    let user = {
        username: req.body.username,
        password: sha512(req.body.password, serverSalt).passwordHash,
        role: 'user'
    };
    users.create(user)
        .then (() => {
        res.redirect('/');
    })
    .catch(err => {
        console.log('could not create user:', err);
        res.redirect('/sign_up');
    });
});

app.get('/login', (req, res) =>  {
    console.log('someone wants to log in.');
res.render('login', {user: req.user});
});


app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

app.get('/logout',
    checkAuth,
    (req, res) => {
        req.logout();
        res.redirect('/');
    });

let portNum = config.port;
app.listen(portNum, () => console.log(`Server started on port ${portNum}.`));