const Tour = require('../models/tourModels');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
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
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

// .set(
//   'Content-Security-Policy',
//   'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com',
// )

exports.getLoginForm = catchAsync(async (req, res, next) => {
  //   const user = User.findOne();

  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // Current bookings for the current user

  const bookings = await Booking.find({ user: req.user.id });

  // Find tours with the return Id

  const tourId = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourId } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
