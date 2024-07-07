const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadResume, getResumes } = require('../controller/resumeController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/:userId', getResumes);


module.exports = router;
