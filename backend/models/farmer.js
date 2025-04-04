const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.js');

const Farmer = sequelize.define('Farmer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: User, key: 'id' } },
  account_no: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false }
});

User.hasOne(Farmer, { foreignKey: 'id' });
Farmer.belongsTo(User, { foreignKey: 'id' });

module.exports = Farmer;
