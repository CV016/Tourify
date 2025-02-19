const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');


const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview,
  );
module.exports = router;
