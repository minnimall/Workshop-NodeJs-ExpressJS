module.exports = ( req, res, next ) => {
    const send = ( status, message, data = null ) => 
        res.status(status).send({ status, message, data })

    res.ok = ( message, data ) => send(200, message, data)
    res.created = ( message, data ) => send(201, message, data)
    res.badRequest = ( message ) => send(400, message)
    res.unauthorized = ( message ) => send(401, message)
    res.serverError = ( message ) => send(500, message)

    next()
}
