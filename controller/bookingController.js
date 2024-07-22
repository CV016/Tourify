const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModels');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('./../utils/appError');
// const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  try {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      return next(new Error('No tour found with that ID'));
    }

    // console.log(process.env.STRIPE_SECRET_KEY);

    // 2) Create checkout session
    console.log(stripe.checkout.sessions);
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
      return next(new Error('Failed to create Stripe checkout session'));
    }

    // 3) Create session as response
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
