// app.js

const express = require('express')
const session = require('express-session')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const passport = require('passport')
const path = require('path')
const { prisma } = require('./lib/prisma.js')

require('dotenv').config()

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(session({
    store: new PrismaSessionStore(prisma, { checkPeriod: 2 * 60 * 1000, dbRecordIdIsSessionId: true }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))

require('./passport/local')

app.use(passport.initialize())
app.use(passport.session())

const indexRouter = require('./routes/indexRouter')
app.use('/', indexRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, (err) => {
    console.log("Running on ", PORT)
    if (err) throw err
})
