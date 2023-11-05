const router = require('express').Router();
const userService = require('./user.service');
const userMiddleware = require('./user.middlewares')
const cookieParser = require('cookie-parser');
const { cookieAuth } = require('../auth/globalAuth');

router.use(cookieParser())

router.post('/signup', userMiddleware.validateSignup, async(req, res) => {
    const reqBody = req.body;

    const response = await userService.signup(reqBody);

    if (response.statusCode == 400) {
        res.render('404', {message: response.message})
    }else if (response.statusCode == 403) {
        res.render('signup', {message: response.message})
    }else{
        res.cookie('jwt', response.token);
        res.cookie('user', response.newUser.email);

        res.redirect('/')
        // res.redirect(`/profile/@${response.newUser.email.split('@')[0]}`);
    }
})



router.post('/login', userMiddleware.validateLogin, async(req, res) => {
    const reqBody = req.body;

    const response = await userService.login(reqBody);

    if (response.statusCode == 404){
        res.render('login', {message: response.message, user: null})
    }else if (response.statusCode == 400) {
        res.redirect('/404');
    }else{
        res.cookie('jwt', response.token);
        res.cookie('user', response.existingUser.email)

        console.log('login');
        // res.redirect('/')
        res.redirect(`/dashboard/@${response.existingUser.email.split('@')[0]}`)
    }
})


// Protected
router.use(cookieAuth)

// Logout Route
router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/')
})

module.exports = router;
