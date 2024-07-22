const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const viewsController = require('../controller/viewsController');
const bookingController = require('../controller/bookingController');
//ROUTES

// router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview,
);
router.get('/tours/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

// TODO Create a login route , template

module.exports = router;
