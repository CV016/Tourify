const express = require('express');
const multer = require('multer');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

const upload = multer({ dest: 'public/img/users' });

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// All routes after this middleware are protected
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', upload.single('photo'), userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// all routes are this middleware are only meant to be accessed by the admin
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
