require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 10000 });
    const users = await User.find().lean().limit(20);
    console.log('users count =', users.length);
    users.forEach(u => {
      console.log(JSON.stringify({ email: u.email, password: u.password, user_type: u.user_type, role: u.role, status: u.status }));
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
