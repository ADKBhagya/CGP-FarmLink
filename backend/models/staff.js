const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.js');

const Staff = sequelize.define('Staff', {
  id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: User, key: 'id' } },
  post: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false }
});

User.hasOne(Staff, { foreignKey: 'id' });
Staff.belongsTo(User, { foreignKey: 'id' });

module.exports = Staff;
