const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');
const { register, login, me } = require('../controllers/authController');

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', loginLimiter, asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(me));

module.exports = router;
