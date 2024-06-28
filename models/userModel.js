const mongoose = require('mongoose');

const validator = require('validator');

// Model Schema will consist of name,email,photo,password,confirmpassword

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'A user must have a Firstname'],
    trim: true,
    maxlength: [30, 'Firstname cannot exceed 30 characters'],
    minlength: [3, 'Firstname should be greater than or equal to 3 characters'],
  },

  lastName: {
    type: String,
    required: [true, 'A user must have a Lastname'],
    trim: true,
    maxlength: [30, 'Lastname cannot exceed 30 characters'],
    minlength: [3, 'Lastname should be greater than or equal to 3 characters'],
  },

  mail: {
    type: String,
    required: [true, 'A user must have a mail ID'],
    trim: true,
    unique: true,
    local: true,
  },

  photo: {
    type: String,
  },

  password: {
    type: String,
    required: [true, 'A useraccount must have a password'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
