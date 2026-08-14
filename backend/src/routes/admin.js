const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const adminMiddleware = require('../middleware/adminAuth');
const {
  listBusinesses,
  deleteBusiness,
  resetUserPassword,
} = require('../controllers/adminController');

const router = Router();

router.use(asyncHandler(adminMiddleware));

router.get('/businesses', asyncHandler(listBusinesses));
router.delete('/businesses/:id', asyncHandler(deleteBusiness));
router.patch('/users/:id/password', asyncHandler(resetUserPassword));

module.exports = router;
