const users = require('./modules/users.js');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const config = require('./modules/config');

const main_routes = require('./routes/mainroutes');
const calendar_routes = require('./routes/calendar');
const auth_routes = require ('./routes/auth');
const profile_routes = require ('./routes/profile');
const event_routes = require ('./routes/events');
const add_event_routes = require ('./routes/add_event');
const api_routes = require('./routes/api');

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/jq', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'SEGReT$25_',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const serverSalt = config.salt;

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

app.use('/', main_routes);
app.use('/', calendar_routes);
app.use('/', auth_routes);
app.use('/', api_routes);
app.use('/', profile_routes);
app.use('/', event_routes);
app.use('/', add_event_routes);
// app.use('/', api);
// app.use((req, res) => {
//     res.render('404');
// });

let portNum = config.port;
app.listen(portNum, () => console.log(`Server started on port ${portNum}.`));