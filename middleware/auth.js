const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        let token = req.headers.authorization
        if (!token) return res.unauthorized('invalid token.')

        token = token.replace('Bearer ', '')
        req.auth = jwt.verify(token, process.env.JWT_SECRET)

        next()
    } catch (error) {
        res.unauthorized('invalid token.')
    }
}