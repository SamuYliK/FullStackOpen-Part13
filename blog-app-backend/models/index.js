const Blog = require('./blog')
const User = require('./user')
const ReadingLists = require('./reading_lists')
const ActiveSessions = require('./active_sessions')

User.hasMany(Blog)
Blog.belongsTo(User)

User.belongsToMany(Blog, { through: ReadingLists, as: 'markedBlogs' })
Blog.belongsToMany(User, { through: ReadingLists, as: 'markedUsers' })

User.hasOne(ActiveSessions)
ActiveSessions.belongsTo(User)

module.exports = {
    Blog, User, ReadingLists, ActiveSessions
}