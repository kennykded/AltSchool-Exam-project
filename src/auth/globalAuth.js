const jwt = require('jsonwebtoken');
require('dotenv').config()

exports.cookieAuth = (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            res.cookie('error', "Login or Signup to perform action")
            res.redirect('/logout')
        }
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decodedToken) {
            res.cookie('error', "Login or Signup to perform action")
            res.redirect('/logout')
        }
        
        res.locals.user = decodedToken;
        res.cookie('user', decodedToken.email)
        
        next()
    } catch (error) {
        res.cookie('error', "Login or Signup to perform action");
        res.redirect('/logout')
    }
}
