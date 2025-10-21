const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: String,
  balance: Number
});

module.exports = mongoose.model('Account', accountSchema);
