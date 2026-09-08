// passport/local.js

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const utils = require('../lib/utils')
const { prisma } = require('../lib/prisma.js')

passport.use(
    new LocalStrategy(async (username, password, done) => {
        const user = await prisma.user.findUnique({
            where: { username: username }
        })
        if (!user) {
            return done(null, false, { msg: "User doesn't exist.", uname: username })
        }

        const valid = await utils.passValid(password, user.hash)
        if (!valid) return done(null, false, { msg: "Password is incorrect.", uname: username })

        return done(null, user)

    })
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: id}
        })
        done(null, user)
    } catch (error) {
        done(error)
    }
})

