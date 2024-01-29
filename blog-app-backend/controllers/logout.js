const router = require('express').Router()

const { User, ActiveSessions } = require('../models')
const { tokenExtractor } = require('../util/middleware')

router.delete('/', tokenExtractor, async (req, res) => {
    const user = await User.findByPk(req.decodedToken.id)
    if (user.id) {
        await ActiveSessions.destroy({
            where: {
                userId: user.id
            }
        })
        res.json({ success: 'Logout was successful' })
    } else {
        res.status(401).json({ error: 'Token used was not valid.' })
    }
})

module.exports = router