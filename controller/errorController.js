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

const sendErrorDevelopment = (err, res) => {
  // console.log('Send Error to Developement!', err.name);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res) => {
  // Trusted Error : Can be showed to the client

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown error we don't wanna leak info about to the user
  else {
    // logging the error
    console.error('ERROR!', err);

    // generating error message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log('Global Error Triggered');
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // console.log(err.statusCode, err.status);

  // console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'developement') {
    // console.log('we are in developement phase');
    sendErrorDevelopment(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log('We are in production phase');
    let error = { ...err };
    // console.log('This is the error');
    // console.log('This is the name of the error', err.name);
    // console.log(error);
    error.message = err.message;

    // console.log('This is a Cast Error Man');
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // console.log('This is the name of the error', err.name);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProduction(error, res);
  }
};
