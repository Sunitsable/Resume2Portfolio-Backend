// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { signup, login } = require('../controller/authController');

// POST /signup - Register new user
router.post('/signup', signup);

// POST /login - Login user
router.post('/login', login);

module.exports = router;
