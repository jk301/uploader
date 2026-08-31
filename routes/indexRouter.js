// routes/indexRouter.js

const { Router } = require('express')
const indexController = require('../controllers/indexController.js')
const passport = require('passport')

const indexRouter = Router()

indexRouter.get('/', indexController.getMain)

// run req.isAuthenticated() for gating routes
indexRouter.get('/protected', indexController.getProtected)

indexRouter.post('/login', passport.authenticate('local'), indexController.postLogin)
indexRouter.post('/logout', indexController.postLogout)


module.exports = indexRouter