const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModels');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');
const AppError = require('../utils/appError');

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Ensure Stripe is initialized

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  try {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    // 2) Ensure req.user and req.params are not undefined
    if (!req.user || !req.user.email || !req.user.id || !req.params.tourId) {
      return next(new AppError('Invalid user or tour information', 400));
    }

    // console.log(
    //   req.user,
    //   req.user.email,
    //   req.user.id,
    //   req.params.tourId,
    //   tour,
    //   req.protocol,
    //   tour.slug,
    // );

    // 3) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`http://www.natours.dev/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    });

    if (!session) {
      return next(
        new AppError('Failed to create Stripe checkout session', 500),
      );
    }

    // Log session to debug issues
    // console.log('Stripe session created:', session);

    // 4) Send session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (err) {
    console.error('Error creating checkout session:', err.message);
    next(err);
  }
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  console.log('Query Parameters:', tour, user, price); // Log query parameters

  // Check if the parameters are present
  if (!tour || !user || !price) {
    console.error('Missing query parameters!');
    return next();
  }

  // Attempt to create the booking
  try {
    await Booking.create({ tour, user, price });
    console.log('Booking created successfully');
  } catch (err) {
    console.error('Error creating booking:', err.message);
  }

  // Redirect to the original URL without query parameters
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.handleCreateOne(Booking);
exports.getBooking = factory.handleGetOne(Booking);
exports.getAllBooking = factory.handleGetAll(Booking);
exports.updateBooking = factory.handleUpdateOne(Booking);
exports.deleteBooking = factory.handleDeleteOne(Booking);
