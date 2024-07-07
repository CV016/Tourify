const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handleFactory = require('./handleFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // if any information related to password is passed then throw error.

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This is not the correct router for updating passwords.\n Please visit /updateMyPassword',
        400,
      ),
    );
  }

  // filtered the unwanted body and update the user
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // send back the response

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is Not meant for these regular purposes, Please use signUp instead.Thanks!',
  });
};

exports.getAllUsers = handleFactory.handleGetAll(User);
exports.getUser = handleFactory.handleGetOne(User);
// Do not change user Password with this
exports.updateUser = handleFactory.handleUpdateOne(User);
exports.deleteUser = handleFactory.handleDeleteOne(User);
