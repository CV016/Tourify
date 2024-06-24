const express = require('express');

const tourController = require('../controller/tourController');

const route = express.Router();

// route.param('id', tourController.checkId);

route
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

route
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

route
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = route;
