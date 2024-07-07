require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const resumeRoutes = require('./routes/resumeRoutes');
const authRoutes=require('./routes/authRoutes')
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

app.use('/api/resumes', resumeRoutes);
app.use('/api/auth',authRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
