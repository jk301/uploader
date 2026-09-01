// mid.optAuth.js

function optAuth (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/')
    } else {
        next()
    }
}

module.exports = {
    optAuth
}