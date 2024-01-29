const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const { User, ActiveSessions } = require('../models')

router.post('/', async (req, res) => {
    const { username, password } = req.body

    const user = await User.scope('withPasswordHash').findOne({
        where: {
            username: username
        }
    })

    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return res.status(401).json({
            error: 'invalid username or password'
        })
    }

    if (user.disabled) {
        await ActiveSessions.destroy({
            where: {
                userId: user.id
            }
        })
        return res.status(401).json({
            error: 'account disabled, please contact admin'
        })
    }

    const existing_session = await ActiveSessions.findOne({
        where: {
            userId: user.id
        }
    })
    
    if (existing_session) {
        res.json({
            info: 'You are already logged in, but here is your info.',
            token: existing_session.token, username: user.username, name: user.name
        })
    } else {
        const userForToken = {
            username: user.username,
            id: user.id
        }

        const token = jwt.sign(userForToken, SECRET, { expiresIn: 60*60 })

        await ActiveSessions.create({
            userId: user.id,
            token
        })
    
        res
            .status(200)
            .send({ token, username: user.username, name: user.name })
    }
})

module.exports = router