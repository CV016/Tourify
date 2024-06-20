const express = require('express');

const tourController = require('../controller/tourController');

const route = express.Router();

route.param('id', tourController.checkId);

route
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkTourBody, tourController.createTour);

route
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = route;
