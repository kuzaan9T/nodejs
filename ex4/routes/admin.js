const express = require('express');
const { getOverview } = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

router.get('/overview', protect, authorize('admin'), getOverview);

module.exports = router;
