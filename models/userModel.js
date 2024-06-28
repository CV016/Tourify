const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Model Schema will consist of name,email,photo,password,confirmpassword

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a Firstname'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    minlength: [3, 'Name should be greater than or equal to 3 characters'],
  },

  email: {
    type: String,
    required: [true, 'A user must have a mail ID'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid Email'],
  },

  photo: {
    type: String,
  },

  password: {
    type: String,
    required: [true, 'Provide a password'],
    minlenght: [8, 'A password must be 8 characters long'],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
