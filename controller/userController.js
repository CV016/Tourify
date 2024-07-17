const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handleFactory = require('./handleFactory');

/* This code snippet is setting up a configuration for handling file uploads using the `multer`
middleware in a Node.js application. Here's a breakdown of what each part is doing: */

/*It defines how and where the uploaded files should be
stored on the server. */

// for storing images into the disk

// const multerStorage = multer.diskStorage({
//   destination: (req, file, callBack) => {
//     callBack(null, 'public/img/users');
//   },
//   filename: (req, file, callBack) => {
//     const ext = file.mimetype.split('/')[1];
//     callBack(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// used for storing data into buffer memory
const multerStorage = multer.memoryStorage();

/**
 * The function `multerFilter` checks if the uploaded file is an image and calls the callback function
 * accordingly.
 * @param req - The `req` parameter in the `multerFilter` function stands for the request object. It
 * contains information about the HTTP request made to the server, including headers, parameters, body
 * data, etc. In the context of file uploading with Multer, the `req` parameter is used to access
 * @param file - The `file` parameter in the `multerFilter` function represents the file being
 * uploaded. It contains information about the file such as its name, size, mimetype, and other
 * properties. In the context of the function, we are checking if the mimetype of the file starts with
 * 'image' to
 * @param callBack - The `callBack` parameter in the `multerFilter` function is a callback function
 * that is used to handle the result of the filter operation. It is a function that takes two
 * arguments: an error (if any) as the first argument and a boolean value indicating whether the file
 * should be accepted
 */
const multerFilter = (req, file, callBack) => {
  if (file.mimetype.startsWith('image')) {
    callBack(null, true);
  } else {
    callBack(
      new AppError('Not an image!. Please upload only Images.', 404),
      false,
    );
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  if (req.file) filteredBody.photo = req.file.filename;

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
