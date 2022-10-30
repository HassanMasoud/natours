const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters'],
  },
  passwordConfirm: {
    type: String,
    required: true,
    min: [8, 'Password must be at least 8 characters'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
