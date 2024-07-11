const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const User = require('../models/userModel');
// const userController = require('../controller/userController');

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get data from the collection
  const tours = await Tour.find();

  if (!tours) next(new AppError('Something went wrong', 404));

  // Build template and render the fetched data using that build template
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });

  //   next();
});

exports.getTour = catchAsync(async (req, res, next) => {
  // get data for the requested tour (including guides and users)

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) return next(new AppError('There is no tour with that name', 404));
  // Build Template

  //Render template
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com',
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  //   const user = User.findOne();

  res.status(200).render('login', {
    title: 'Log into your account',
  });
});
