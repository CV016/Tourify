const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRouter');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//GLOBAL MIDDLEWARES

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: ["'self'", 'https://*.cloudflare.com'],
      scriptSrc: ["'self'", 'https://*.stripe.com'],
      scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],
      frameSrc: ["'self'", 'https://*.stripe.com'],
      objectSrc: ["'none'"],
      // styleSrc: ["'self'", 'https:', 'unsafe-inline'],
      workerSrc: ['data:', 'blob:'],
      childSrc: ["'self'", 'blob:'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],
      upgradeInsecureRequests: [],
    },
  }),
);

// app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'data:'],
//       scriptSrc: ["'self'", 'https://*.cloudflare. com'],
//       objectSrc: ["'none'"],
//       styleSrc: ["'self'", 'https:', 'unsafe-inline'],
//       upgradeInsecureRequests: [],
//     },
//   }),
// );

// developement logging
if (process.env.NODE_ENV === 'developement') {
  app.use(morgan('dev'));
}

// limit request on api from same ip
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this ID!. Please try again in an hour',
});
app.use('/api', limiter);

// reading data from body into req.body
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'macGroupSize',
      'difficulty',
    ],
  }),
);

// // serving static files
// app.use(express.static(`${__dirname}/public`));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
