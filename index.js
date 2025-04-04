const sequelize = require('./config/database.js');
const User = require('./models/user.js');
const Farmer = require('./models/farmer.js');
const Staff = require('./models/staff.js');
const Buyer = require('./models/buyer.js');

const syncDB = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Database synchronization failed:', error);
  }
};

syncDB();
