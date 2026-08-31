// controllers/indexController.js

function getMain(req, res) {
    return res.render('index')
}

function getProtected (req, res) {
    return res.render('protected')
}

// run passport.authenticate('local') mid
function postLogin (req, res) {
    // redirect 
}

function postLogout (req, res) {
    // req.logout() or something
}


module.exports = {
    getMain,
    getProtected,
    postLogin,
    postLogout
}