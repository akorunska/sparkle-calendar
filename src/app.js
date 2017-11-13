const users = require('./modules/users.js');
const events = require('./modules/events.js');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const moment = require('moment');
const multer = require('multer');
// const sharp = require('sharp');
const app = express();
let config = require('./modules/config');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/jq', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));


let upload = multer({dest: 'public/images/' });

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
    if (!req.user) return res.redirect('/login');
    next();
}

function checkAuthor(req, res, next) {
    events.getById(req.params.guid)
        .then(event => {
            if(req.params.guid !== req.user.id)
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    next();
}

app.get('/',
    (req,res) =>  {
        let display_date = moment().format("dddd, MMMM Do YYYY");
        let event_list;
        if (req.user) {
            let search_date = (moment().format()).substring(0, (moment().format()).indexOf('T'));
            events.getByDate(req.user.id, search_date)
                .then(data => {
                    event_list = data;
                    res.render('index', {user: req.user, date: display_date, event_list});
                })
                .catch(err => {
                    console.log(err);
                    res.render('index', {user: req.user, date: display_date, event_list});
                });
        } else {
            res.render('index', {user: req.user, date: display_date, event_list});
        }
    });

app.get('/sign_up',
    (req, res) => {
    res.render('sign_up', {user: req.user});
});

app.post('/sign_up', (req, res) => {
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

app.get('/login', (req, res) =>  {
    res.render('login', {user: req.user});
});


app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

app.get('/logout',
    checkAuth, (req, res) => {
        req.logout();
        res.redirect('/');
    });


app.get('/profile',
    checkAuth, (req, res) => {
        res.render('profile', {user: req.user});
    });

app.get('/edit_profile',
    checkAuth, (req, res) => {
        res.render('edit_profile', {user: req.user});
    });

app.post('/edit_profile',
    checkAuth, (req, res) => {
        console.log("received data from form:", req.body);
        let user = {
            id: req.user.id,
            username: req.user.username,
            password: req.user.password,
            fullname: req.body.fullname,
            email: req.body.email,
            telegram: req.body.telegram,
            role: 'user',
            profile_pic: req.user.profile_pic
        };
        users.update(user)
                    .catch(err => {console.log('An error while updating: ', err, "\n");});
        // sharp('/images' + req.file.filename).resize(400, 400);
        res.redirect('/profile');
    });

app.get('/edit_profile_img', (req, res) => {
    res.render('edit_profile_img', {user: req.user});
});

app.post('/edit_profile_img', upload.single('pic'),
    checkAuth, (req, res) => {
        let user = {
            id: req.user.id,
            username: req.user.username,
            password: req.user.password,
            fullname: req.user.fullname,
            email: req.user.email,
            telegram: req.user.telegram,
            role: 'user',
            profile_pic: '/images/' + req.file.filename
        };
        users.update(user)
            .catch(err => {console.log('An error while updating a pic: ', err, "\n");});

        res.redirect('/profile');
    });

app.get('/add_event', checkAuth, (req, res) => {
    let date = (moment().format()).substring(0, (moment().format()).indexOf('T'));
    res.render('add_event', {user: req.user, date});
});

app.post('/add_event',
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

let portNum = config.port;
app.listen(portNum, () => console.log(`Server started on port ${portNum}.`));