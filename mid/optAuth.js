// mid.optAuth.js

const passport = require('passport')

function optAuth (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/')
    } else {
        next()
    }
}

function customLoginHandler (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err)
        
        if (!user) {
            return res.render('login', { alerts: [info.msg], username: info.uname })
        }

        req.logIn(user, (err) => {
            if (err) return next(err)
            return res.redirect('/')
        })
    }) (req, res, next)
}

module.exports = {
    optAuth,
    customLoginHandler
}