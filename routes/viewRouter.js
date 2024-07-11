const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const viewsController = require('../controller/viewsController');
//ROUTES

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tours/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

// TODO Create a login route , template

module.exports = router;
