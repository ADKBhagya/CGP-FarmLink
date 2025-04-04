const User = require('../models/user.js');
const Farmer = require('../models/farmer.js');
const Staff = require('../models/staff.js');
const Buyer = require('../models/buyer.js');

exports.createUser = async (req, res) => {
  try {
    const { name, email, contact_no, nic, role, account_no, address, post, username, password } = req.body;

    const user = await User.create({ name, email, contact_no, nic, role });

    if (role === 'Farmer') {
      await Farmer.create({ id: user.id, account_no, address });
    } else if (role === 'Staff') {
      await Staff.create({ id: user.id, post, address });
    } else if (role === 'Buyer') {
      await Buyer.create({ id: user.id, username, password, address });
    }

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ include: [Farmer, Staff, Buyer] });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
