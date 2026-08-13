const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const adminMiddleware = require('../middleware/adminAuth');
const { listBusinesses } = require('../controllers/adminController');

const router = Router();

router.use(asyncHandler(adminMiddleware));

router.get('/businesses', asyncHandler(listBusinesses));

module.exports = router;
