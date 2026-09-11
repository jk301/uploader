// controllers/indexController.js

const { prisma } = require('../lib/prisma.js')
const utils = require('../lib/utils.js')
const dayJs = require('dayjs')

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
        const folders = await prisma.folder.findMany({
            where: { userId: user.id },
            include: { file: true }
        })
        return res.render('index', { logged: true, user: user, folders: folders})
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
    return res.render('upload', { folderId: req.query.folderId })
}

async function getFolderRename (req, res) {
    const folderId = Number(req.query.folderId)

    const folder = await prisma.folder.findUnique({
        where: { id: folderId }
    })

    if (!folder || folder.userId !== req.user.id) {
        return res.redirect('/')
    }


    return res.render('renameFolder', { folder: folder })
}

function getFolder (req, res) {
    return res.render('folder')
}

async function getFileView (req, res) {
    const fileId = Number(req.params.id)
    const userId = req.user.id
    
    const file = await prisma.file.findUnique({
        where: { id: fileId }
    }) 

    if (!file || file.userId !== userId) {
        // delete before deployment
        console.log(`file: ${file}`)
        return res.redirect('/')
    }

    const newTime = dayJs(file.addedAt).format('MMM D, YYYY [at] h:mm A')
    file.addedAt = newTime

    let size = file.sizeBytes
    if (size >= 1000000) {
        size = `${(size / 1000000).toFixed(1)} MB` 
    } else if (size >= 100000) {
        size = `${Math.round(size / 1000)} KB`
    } else {
        size = `${size} B`
    }

    return res.render('fileView', { file: file, size: size })
}

async function getDownloadUrl (req, res) {
    const fileId = Number(req.params.id)
    const userId = req.user.id

    const file = await prisma.file.findUnique({
        where: { id: fileId }
    }) 

    if (!file || file.userId !== userId) return res.redirect('/')

    const { data, error } = await supabase.storage
        .from('files')
        .createSignedUrl(file.link, 60, { download: file.name })

    if (error) {
        console.error(error)
        return res.redirect('/')
    }

    res.redirect(data.signedUrl)

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
    const folderId = Number(req.body.folderId)

    // Limited to 40MB
    if (file.size >= 40000000) {
        return res.render('upload', {
            folderId: folderId, 
            alerts: ['Files should be under 40 MB']
        })
    }

    const folder = await prisma.folder.findUnique({
        where: {id: folderId}
    })

    if (!folder || folder.userId !== userId) {
        if (req.user) {
            const folders = await prisma.folder.findMany({
                where: { userId: userId }, 
                include: { file: true }
            })

            return res.render('index', {
                logged: true,
                user: req.user,
                folders,
                alerts: ['Create a folder first (naughty)']
            })
        }
        return res.render('index', {
            alerts: ['Unauthorized!']
        })

    }

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
            folderId: folderId, 
            userId: userId
        }
    })

    return res.redirect('/')
}

async function postRenameFolder (req, res) {
    const folderName = req.body.newName 
    const userId = req.user.id
    const folderId = Number(req.body.folderId)

    const folder = await prisma.folder.findUnique({
        where: { id: folderId }
    })

    if (!folder || folder.userId !== userId) {
        console.log("user mismatch or folder doesn't exist")
        return res.redirect('/')
    }

    if (folder.name === folderName)  {
        return res.redirect('/')
    } else {
        await prisma.folder.update({
            data: { name: folderName }, 
            where: { id: folderId }
        })
        return res.redirect('/')
    }

}

async function postFolder (req, res) {
    const folderName = req.body.folderName
    const userId = req.user.id

    const result = await prisma.folder.create({
        data: {
            name: folderName, 
            userId: userId
        }
    })

    res.redirect('/')
}

async function getExpiryTime (req, res) {
    const folderId = Number(req.body.folderId)
    const user = req.user

    const folder = await prisma.folder.findUnique( { where: { id: folderId} } )

    if (!folder || folder.userId !== user.id) {
        const folders = await prisma.folder.findMany({
            where: { userId: user.id },
            include: { file: true }
        })

        return res.render('index', {
            logged: true,
            user: user, 
            folders: folders,
            alerts: ["Folder does not exist"]
        })
    }

    return res.render('setTime', { folder })

}

async function postSetExpiryTime (req, res) {
    const folderId = Number(req.body.folderId)
    const expTime = Number(req.body.expTime)
    const userId = req.user.id

    const folder = await prisma.folder.findUnique({ where: { id: folderId }})

    if (!folder || folder.userId !== userId) {
        return res.redirect('/')
    }

    const share = await prisma.folderShare.create({
        data: {
            folderId: folderId,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * expTime)
        }
    })

    share.expiresAt = dayJs(share.expiresAt).format('MMM D, YYYY [at] h:mm A')

    const fullUrl = `${req.protocol}://${req.get('host')}/share/${share.id}`

    return res.render('linkShare', { 
        folder, 
        shareUrl: fullUrl, 
        expiresAt: share.expiresAt
    })
}

// async function postCreateFolderShare (req, res) {
//     const folderId = Number(req.body.folderId)
//     const userId = req.user.id

//     const folder = await prisma.folder.findUnique( { where: { id: folderId} } )
//     if (!folder || folder.userId !== userId) return res.redirect('/')

//     const share = await prisma.folderShare.create({
//         data: {
//             folderId: folderId,
//             expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 1) // 1h
//         }
//     })

//     res.redirect(`/share/${share.id}`)
// }

async function getFolderShare (req, res) {
    const token = req.params.token
    const user = req.user

    const share = await prisma.folderShare.findUnique({
        where: { id: token },
        include: { folder: { include: { file: true } } }
    })

    if (!share || share.expiresAt < new Date()) {
        if (share) await prisma.folderShare.delete({ where: { id: token } })

        const alerts = [!share ? "Folder not found" : "Folder link expired"]

        if (user) {
            const folders = await prisma.folder.findMany({
                where: { userId: user.id },
                include: { file: true }
            })
            return res.render('index', {
                logged: true,
                user: user, 
                folders: folders,
                alerts: alerts
            })
        }

        return res.render('index', { alerts })
    }

    const filesWithUrls = await Promise.all(
        share.folder.file.map(async (file) => {
            const { data } = await supabase.storage
                .from('files')
                .createSignedUrl(file.link, 60 * 5, { download: file.name })
            return { name: file.name, url: data?.signedUrl }
        })
    )
    share.expiresAt = dayJs(share.expiresAt).format('MMM D, YYYY [at] h:mm A')

    res.render('folderShare', {
        folderName: share.folder.name, 
        files: filesWithUrls, 
        expires: share.expiresAt 
    })
}

async function deleteFolder (req, res) {
    const folderId = Number(req.params.id)
    const userId = req.user.id

    const folder = await prisma.folder.findUnique({
        where: { id: folderId }, 
        include: { file: true }
    })
    
    if ( !folder || folder.userId !== userId) {
        console.log(folder)
        return res.redirect('/')
    }
    
    if (folder.file.length > 0) {
        const filePaths = folder.file.map( file => file.link)
        const { error } = await supabase.storage.from("files").remove(filePaths)
        if (error) {
            console.error(error)
            return res.redirect('/')
        }
    }

    await prisma.file.deleteMany({ where: { folderId: folderId } })
    await prisma.folder.delete({ where: { id: folderId } })

    res.redirect('/')
}

async function deleteFile (req, res) {
    const fileId = Number(req.params.id)
    const userId = req.user.id

    const file = await prisma.file.findUnique({
        where: { id: fileId }
    })

    if ( !file || file.userId !== userId) {
        console.log(file)
        return res.redirect('/')
    }

    const { error } = await supabase.storage
        .from('files')
        .remove([file.link])

    if (error) {
        console.error(error)
        return res.redirect('/')
    }

    const result = await prisma.file.delete({
        where: { id: fileId }
    })

    res.redirect('/')

}


module.exports = {
    getMain,
    getRegister,
    getLogin,
    getProtected,
    getUpload,
    getFolder,
    getFileView,
    getDownloadUrl,
    getFolderRename,
    getFolderShare,
    getExpiryTime,

    postSetExpiryTime,
    postRegister,
    postLogin,
    postLogout,
    postUpload,
    postFolder,
    deleteFolder,
    postRenameFolder,
    // postCreateFolderShare,
    deleteFile,
}