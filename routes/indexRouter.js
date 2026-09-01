// routes/indexRouter.js

const { Router } = require('express')
const indexController = require('../controllers/indexController.js')
const passport = require('passport')
const optAuth = require('../mid/optAuth.js')
const indexRouter = Router()

indexRouter.get('/', indexController.getMain)
indexRouter.get('/register', indexController.getRegister)
indexRouter.get('/login', indexController.getLogin)

// protect route
indexRouter.get('/upload', optAuth.optAuth , indexController.getUpload)

// run req.isAuthenticated() for gating routes
// indexRouter.get('/protected', indexController.getProtected)

indexRouter.post('/register', indexController.postRegister)
indexRouter.post('/login', passport.authenticate('local'), indexController.postLogin)
indexRouter.post('/logout', indexController.postLogout)

// protect route
indexRouter.post('/upload', indexController.postUpload)

module.exports = indexRouter