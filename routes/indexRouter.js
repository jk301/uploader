// routes/indRouter.js

const { Router } = require('express')
const indexController = require('../controllers/indexController.js')

const indexRouter = Router()

indexRouter.get('/', indexController.getMain)
indexRouter.get('/protected', indexController.getProtected)

module.exports = indexRouter