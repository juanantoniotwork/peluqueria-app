const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit');
const { register, login, me } = require('../controllers/authController');

const router = Router();

router.post('/register', registerLimiter, asyncHandler(register));
router.post('/login', loginLimiter, asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(me));

module.exports = router;
