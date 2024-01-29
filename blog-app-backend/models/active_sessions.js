const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class ActiveSessions extends Model {}

ActiveSessions.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'activeSessions'
})

module.exports = ActiveSessions