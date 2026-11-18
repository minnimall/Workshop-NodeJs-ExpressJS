module.exports = (...roles) => (req, res, next) => {
    if (!roles.includes(req.auth.role)) {
        return res.unauthorized('Permission denied')
    }
    next()
}