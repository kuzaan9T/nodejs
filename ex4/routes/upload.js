const express = require('express');
const { uploadProfilePicture } = require('../controllers/uploadController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post('/profile-picture', protect, upload.single('image'), uploadProfilePicture);

module.exports = router;
