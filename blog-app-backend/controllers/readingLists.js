const router = require('express').Router()

const { User, ReadingLists, ActiveSessions } = require('../models')
const { tokenExtractor } = require('../util/middleware')

router.post('/', async (req, res) => {
    const readingListAddition = await ReadingLists.create({
        ...req.body })
    res.json(readingListAddition)
})

router.put('/:id', tokenExtractor, async (req, res) => {
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
        const blogRead = await ReadingLists.findByPk(req.params.id)
        if (blogRead){
            if (user && user.id === blogRead.userId){
                const read = req.body.read
                if (read !== undefined) {
                    blogRead.read = req.body.read
                    await blogRead.save()
                    res.json(blogRead)
                } else {
                    res.status(400).json({ error: `Request needs to include boolean parameter read.` })
                }
            } else {
                res.status(401).json({ error: 'Not authorized. This is not in your reading list.'})
            }
        } else {
            res.status(404).end()
        }
    }
})

module.exports = router