const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { list, create, update, remove } = require('../controllers/appointmentController');

const router = Router();

router.get('/', asyncHandler(list));
router.post('/', asyncHandler(create));
router.put('/:id', asyncHandler(update));
router.delete('/:id', asyncHandler(remove));

module.exports = router;
