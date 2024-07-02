const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if email and password exists.
  if (!email || !password) {
    return next(new AppError('Please Provide a valid Email or Password', 400));
  }

  // Check if the user exists and the password provided is correct.

  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('Either the username or password is incorrect', 401),
    );
  }

  //   console.log(user);

  //if Everything ok sent token to the client.
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and checking if its their

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to Continue', 401),
    );
  }
  // Verification of token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //   console.log(decoded);

  // check if the user still exist

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does not exist anymore',
        401,
      ),
    );
  }

  // check if the user changed password after the token was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password , Please login again!', 401),
    );
  }

  // Grant access to protected routes
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have authority to perform this action', 403),
      );
    }

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email

  // console.log('entering forgot password function');
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('No user found with this email Id', 404));
  }
  // console.log(user);
  // generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // next();

  //send it to user's mail
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

  const message = `Forgot your Password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL} \n if this request was not done by you please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token. (Only valid for 20 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    next(
      new AppError(
        'There was an error sending the email, Please try later',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });


  // check if the token is not expired, and the user still exists

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  // Update changepasswordat property for the user
  //Log the user in , send the jwt token

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
