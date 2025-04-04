const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.js');

const Buyer = sequelize.define('Buyer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: User, key: 'id' } },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }, // Encrypt in real apps
  address: { type: DataTypes.TEXT, allowNull: false }
});

User.hasOne(Buyer, { foreignKey: 'id' });
Buyer.belongsTo(User, { foreignKey: 'id' });

module.exports = Buyer;
