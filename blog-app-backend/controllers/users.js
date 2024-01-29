const bcrypt = require('bcrypt')
const router = require('express').Router()

const { tokenExtractor } = require('../util/middleware')
const { User, Blog, ActiveSessions } = require('../models')

router.get('/', async (req, res) => {
    const users = await User.findAll({
        include: {
            model: Blog,
            attributes: { exclude: ['userId'] }
        }
    })
    res.json(users)
})

router.post('/', async (req, res) => {
    const { username, name, password } = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = await User.create({
        username: username,
        name: name,
        passwordHash: passwordHash
    })
    const user = await User.findByPk(newUser.id)
    res.json(user)
})

router.get('/:id', async (req, res) => {
    const where = {}

    if (req.query.read) {
        where.read = req.query.read === "true"
    } 

    const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
        include: [{
            model: Blog,
            as: 'markedBlogs',
            attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
            through: {
                attributes: { exclude: ['userId', 'blogId'] },
                where
            }
        }]
    })
    if (user){
        res.json({
            name: user.name,
            username: user.username,
            readings: user.markedBlogs
        })
    } else {
        res.status(404).end()
    }
})

router.put('/:username', tokenExtractor, async (req, res) => {
    const requestingUser = await User.findByPk(req.decodedToken.id)
    if (requestingUser.disabled) {
        await ActiveSessions.destroy({
            where: {
                userId: requestingUser.id
            }
        })
        return res.status(401).json({
            error: 'account disabled, please contact admin'
        })
    } else {
        const user = await User.findOne({
            where: {
                username: req.params.username
            },
            include: {
                model: Blog,
                attributes: { exclude: ['userId'] }
            }
        })    
        if (user) {
            if (user.id !== requestingUser.id) {
                res.status(401).json({
                    error: 'You can only modify your own name'
                })
            } else {
                const newName = req.body.name
                if (newName) {
                    user.name = newName
                    await user.save()
                    res.json(user)
                } else {
                    res.status(400).json({ error: `Request needs to include new name for the user.` })
                }
            }
        } else {
            res.status(404).json({ error: `Username not found.` })
        }
    }
})

module.exports = router