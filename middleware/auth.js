const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        let token = req.headers.authorization
        if (!token) return res.status(401).send({ status: 401, message: 'invalid token.', data: null })

        token = token.replace('Bearer ', '')
        req.auth = jwt.verify(token, process.env.JWT_SECRET)

        next()
    } catch (error) {
        res.status(401).send({ status: 401, message: 'invalid token.', data: null })
    }
}