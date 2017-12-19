const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: 'public/images/' });
const users = require('./../modules/users.js');
const auth = require('./auth');

let checkAuth = auth.checkAuth;

router.get('/profile',
    checkAuth, (req, res) => {
        res.render('profile', {user: req.user});
    });

router.get('/profile/edit',
    checkAuth, (req, res) => {
        res.render('edit_profile', {user: req.user});
    });

router.post('/profile/edit',
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

router.get('/profile/edit_img', (req, res) => {
    res.render('edit_profile_img', {user: req.user});
});

router.post('/profile/edit_img', upload.single('pic'),
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

module.exports = router;