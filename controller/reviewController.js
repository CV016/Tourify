const Review = require('../models/reviewModel');
const handleFactory = require('./handleFactory');
// const catchAsync = require('../utils/catchAsync');
// getting all the reviews.

exports.setTourUserIds = (req, res, next) => {
  // allowing nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Writing a new review on a tour as a user.

exports.getAllReviews = handleFactory.handleGetAll(Review);
exports.createReview = handleFactory.handleCreateOne(Review);
exports.deleteReview = handleFactory.handleDeleteOne(Review);
exports.updateReview = handleFactory.handleUpdateOne(Review);
exports.getReview = handleFactory.handleGetOne(Review);
