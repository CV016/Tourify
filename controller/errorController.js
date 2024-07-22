const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  // console.log('CastError Triggered');
  const message = `Invalid ${err.path}: ${err.value}`;
  // console.log(message);
  // console.log('AppError Initiated');
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // console.log('handleDuplicateField Triggered');
  // const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const value = err.keyValue.name;

  // console.log(value);
  const message = `Duplicate Field Value ${value} . Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // console.log('enteredValidationError');
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid Input Data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTInvalidSignature = (err) =>
  new AppError('Invalid token, Please login again.', 401);

const handleExpiredToken = (err) =>
  new AppError('your token has expired please login again!', 401);

const sendErrorDevelopment = (err, req, res) => {
  // console.log('Send Error to Developement!', err.name);

  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: `${err.statusCode} || Something went wrong`,
      msg: err.message,
    });
  }
};

const sendErrorProduction = (err, req, res) => {
  // Trusted Error : Can be showed to the client
  // Production Error from the API
  // console.log('Here is the error!');
  console.log('Hello');
  console.log(err);
  console.log(process.env.SENDINBLUE_PORT);
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: err.message,
      });
    }

    return res.status(500).render('error', {
      title: 'Something went wrong!',
      // title: err.message,
      // message: 'Please try again later',
      message: err.message,
      // message: 'This is block 2',
    });
  }

  // Production error from the rendered website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      // title: 'Something went wrong!',
      message: err.message,
      // message: 'This is block 3',
    });
  }

  // Programming or unknown error we don't wanna leak info about to the user

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
    // message: err.message,
    // message: 'This is block 4',
  });
};

module.exports = (err, req, res, next) => {
  // console.log('Global Error Triggered');
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // console.log(err.statusCode, err.status);

  // console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'developement') {
    // console.log('we are in developement phase');
    sendErrorDevelopment(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log('We are in production phase');
    let error = { ...err };
    // console.log('This is the error');
    // console.log('This is the name of the error', err.name);
    // console.log(error);
    // console.log(err);
    // console.log('This is the err message');
    // console.log(err.message);
    error.message = err.message;
    // console.log(error);
    // console.log(process.env.NODE_ENV);
    // console.log('this is the error msg');
    // console.log(error.message);

    // console.log('This is a Cast Error Man');

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJWTInvalidSignature(error);
    if (error.name === 'TokenExpiredError') error = handleExpiredToken(error);

    sendErrorProduction(error, req, res);
  }
};
