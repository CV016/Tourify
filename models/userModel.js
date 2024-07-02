const crypto = require('crypto');
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

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
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

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(this.passwordChangedAt, JWTTimestamp);
    return changedTimestamp < JWTTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpire = Date.now() + 20 * 60 * 1000;

  console.log({ resetToken }, this.passwordResetToken);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
