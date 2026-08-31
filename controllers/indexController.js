// controllers/indexController.js

function getMain(req, res) {
    return res.render('index')
}

function getProtected (req, res) {
    return res.render('protected')
}


module.exports = {
    getMain,
    getProtected
}