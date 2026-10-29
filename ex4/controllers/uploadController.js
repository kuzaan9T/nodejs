const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'finance-tracker/profile-pictures',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image'
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
};

const uploadProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please send an image in the "image" field' });
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return res.status(500).json({ message: 'Cloudinary is not configured on the server' });
  }

  const result = await uploadToCloudinary(req.file.buffer, req.user._id.toString());

  req.user.profilePicture = result.secure_url;
  await req.user.save();

  res.json({ message: 'Profile picture updated', profilePicture: result.secure_url });
};

module.exports = { uploadProfilePicture };
