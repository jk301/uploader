// routes/indexRouter.js

const { Router } = require('express')
const indexController = require('../controllers/indexController.js')
const passport = require('passport')
const optAuth = require('../mid/optAuth.js')
const indexRouter = Router()

// Multer impl

const multer = require('multer')

// Local (uploads/)
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// })
// const upload = multer({ storage: storage })

const upload = multer({ storage: multer.memoryStorage() })


indexRouter.get('/', indexController.getMain)
indexRouter.get('/register', indexController.getRegister)
indexRouter.get('/login', indexController.getLogin)
indexRouter.get('/folder', optAuth.optAuth, indexController.getFolder)

// protect route
indexRouter.get('/upload', optAuth.optAuth , indexController.getUpload)

// run req.isAuthenticated() for gating routes
// indexRouter.get('/protected', indexController.getProtected)

indexRouter.post('/register', indexController.postRegister)
indexRouter.post('/login', passport.authenticate('local'), indexController.postLogin)
indexRouter.post('/logout', indexController.postLogout)

// protect route
indexRouter.post('/upload',optAuth.optAuth, upload.single('file') ,indexController.postUpload)
indexRouter.post('/folder', optAuth.optAuth, indexController.postFolder)

indexRouter.post('/folder/delete/:id', optAuth.optAuth, indexController.deleteFolder)

indexRouter.post('/folder/:id/delete', optAuth.optAuth, indexController.deleteFile)

module.exports = indexRouter