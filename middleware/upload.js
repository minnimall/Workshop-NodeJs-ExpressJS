const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, unique + path.extname(file.originalname).toLowerCase())
    }
})

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('image') // ชื่อ field ที่ frontend ต้องส่งมาคือ "image"

// ครอบเพื่อให้ error ของ multer ตอบกลับเป็นรูปแบบ { status, message, data } เดิม
module.exports = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) return res.badRequest(err.message)
        next()
    })
}