const errorHandling = (error, req, res, next) => {
    console.error(error)
    if (error.message.includes('Validation isEmail on username failed')) {
        const message = error.message.split("Validation error: ")[1]
        return res.status(400).json({
            error: message,
        })
    }
    next(error)
}

module.exports = errorHandling