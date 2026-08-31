// app.js

const express = require('express')
const path = require('path')

require('dotenv').config()

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const indexRouter = require('./routes/indexRouter')
app.use('/', indexRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, (err) => {
    console.log("Running on ", PORT)
    if (err) throw err
})
