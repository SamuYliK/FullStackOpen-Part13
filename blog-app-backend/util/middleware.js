const jwt = require('jsonwebtoken')
const { SECRET } = require('./config.js')
const { ActiveSessions } = require('../models')

const tokenExtractor = async (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        try {
            req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
            const active = await ActiveSessions.findOne({
                where: {
                    userId: req.decodedToken.id
                }
            })
            if (!active || active.token !== authorization.substring(7)) {
                throw new Error('CustomInactive')
            }
        } catch (error) {
            console.log(error)
            if (error.name === 'TokenExpiredError'){
                await ActiveSessions.destroy({
                    where: {
                        token: authorization.substring(7)
                    }
                })
                return res.status(401).json({
                    error: 'token expired, please login again'
                })
            } else if (error.message === 'CustomInactive') { 
                return res.status(401).json({ error: 'token expired, please login again' })
            } else {
                return res.status(401).json({ error: 'token invalid '})
            }
        }
    } else {
        return res.status(401).json({ error: 'token missing' })
    }
    next()
}

module.exports = { tokenExtractor }