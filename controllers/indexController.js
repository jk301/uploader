// controllers/indexController.js

const { prisma } = require('../lib/prisma.js')
const utils = require('../lib/utils.js')

require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SB_URL, 
    process.env.SB_SECRET 
)

async function getMain(req, res) {
    // for testing
    const user = req.user
    if (user) {
        return res.render('index', { logged: true, user: user})
    } else {
        return res.render('index')
    }
}

function getRegister (req, res) {
    res.render('register')
}

function getLogin (req, res) {
    return res.render('login')
}

function getProtected (req, res) {
    return res.render('protected')
}

function getUpload (req, res) {
    return res.render('upload')
}


async function postRegister (req, res) {
    const password = req.body.password
    const cnfrm_pass = req.body.cnfrm_pass
    const username = req.body.username

    if (password !== cnfrm_pass) {
        return res.render('register', {
            alerts: ["Passwords don't match."],
            username,
            password,
            cnfrm_pass
        })
    }

    try {
        const hash = await utils.passGen(password)

        const result = await prisma.user.create({
            data: {
                username: username,
                hash: hash
            }
        })

        if (result) {
            return res.redirect('/login')
        } else {
            return res.render('register', {
                alerts: ["Couldn't add user for some reason"]
            })
        }

    } catch (err) {

        let msg = 'Something went wrong'

        if (err.code === "P2002") {
            msg = 'Username is already taken.'
        }

        return res.render('register', {
            alerts: [msg],
            username
        })
    }

}

// run passport.authenticate('local') mid handles all data (cool)
async function postLogin (req, res) {
    res.redirect('/')    
}

function postLogout (req, res) {
    req.logout( err => {
        if (err) {
            return res.render('index', { alert: ['Logout failed'] })
        }

        req.session.destroy( err => {
            if (err) {
                return res.render('index', { alert: ['Logout failed'] })
            }
            res.clearCookie('connect.sid')
            return res.redirect('/')
        })
    })
}

async function postUpload (req, res) {
    const file = req.file   
    const userId = req.user.id
    const folderId = req.body.folderId

    const storagePath = `${userId}/${Date.now()}-${file.originalname}`

    const { data, error } = await supabase.storage
    .from('files')
    .upload(storagePath, file.buffer, { contentType: file.mimetype })

    if (error) {
        console.error(error)
        return res.redirect('/')
    }

    const result = await prisma.file.create({
        data: {
            name: file.originalname, 
            sizeBytes: file.size, 
            mimeType: file.mimetype, 
            link: data.path, 
            folderId: Number(folderId), 
            userId: userId
        }
    })

    return res.redirect('/')
}


module.exports = {
    getMain,
    getRegister,
    getLogin,
    getProtected,
    getUpload,
    postRegister,
    postLogin,
    postLogout,
    postUpload
}