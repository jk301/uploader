// passport/local.js

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const utils = require('../lib/utils')

passport.use(
    new LocalStrategy(async (username, password, done) => {
        // const user = find user by username
        // if (!user) return done(null, false)

        // const valid = utils.passValid(password, hashed)
        // if (!valid) return done(null, false)

        // return done(null, user)

    })
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        // const user = try fetching the user by id
        // done(null, user)
    } catch (error) {
        done(error)
    }
})

