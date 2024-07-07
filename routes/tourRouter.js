/* This JavaScript code is setting up routes for a web application using the Express framework. Here's
a breakdown of what each part of the code is doing: */

const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();

// route.param('id', tourController.checkId);

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStatus);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide  '),
    tourController.deleteTour,
  );

module.exports = router;
