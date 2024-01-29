const router = require('express').Router()
const { Op } = require('sequelize')

const { Blog, User, ActiveSessions } = require('../models')
const { tokenExtractor } = require('../util/middleware')

router.get('/', async (req, res) => {
    let where = {}

    if ( req.query.search ) {
        where = {
            [Op.or]: [
                {
                    title: { [Op.iLike]: `%${req.query.search}%` }
                },
                {
                    author: { [Op.iLike]: `%${req.query.search}%` }
                },
            ]
        }
    }

    const blogs = await Blog.findAll({
        attributes: { exclude: ['userId'] },
        include: {
            model: User,
            attributes: ['username']
        },
        where,
        order: [
            ['likes', 'DESC']
        ]
    })
    res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res) => {
    const user = await User.findByPk(req.decodedToken.id)

    if (user.disabled) {
        await ActiveSessions.destroy({
            where: {
                userId: user.id
            }
        })
        return res.status(401).json({
            error: 'account disabled, please contact admin'
        })
    } else {
        const newBlog = await Blog.create({
            ...req.body, userId: user.id })
        res.json(newBlog)
    }
})

router.put('/:id', async (req, res) => {
    const blog = await Blog.findByPk(req.params.id, { 
        attributes: { exclude: ['userId'] },
        include: { model: User, attributes: ['username'] }
    })
    if (blog) {
        const likes = req.body.likes
        if (likes) {
            blog.likes = req.body.likes
            await blog.save()
            res.json(blog)
        } else {
            res.status(400).json({ error: `Request needs to include likes with their new amount.` })
        }
    } else {
        res.status(404).json({ error: `Blog with id=${req.params.id} not found` })
    }
})

router.delete('/:id', tokenExtractor, async (req, res) => {
    const user = await User.findByPk(req.decodedToken.id)
    if (user.disabled) {
        await ActiveSessions.destroy({
            where: {
                userId: user.id
            }
        })
        return res.status(401).json({
            error: 'account disabled, please contact admin'
        })
    } else {
        const blogToDelete = await Blog.findByPk(req.params.id)
        if (user && user.id === blogToDelete.userId){
            await blogToDelete.destroy()
            res.status(204).end()
        } else {
            res.status(401).json({ error: 'Not authorized. This blog was not added by you.'})
        }
    }
})

module.exports = router