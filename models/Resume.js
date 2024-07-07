const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  //user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    links: { type: Array, required: true }
  },
  education: [
    {
      College: { type: String, required: true },
      Scores: { type: String, required: true },
      Tenure: { type: String, required: true }
    }
  ],
  Achievements: { type: Array, required: true },
  projects: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      techStack: { type: Array, required: true },
      link: { type: String, required: true }
    }
  ],
  skills: { type: Array, required: true },
  experience: [
    {
      Role: { type: String, required: true },
      Company: { type: String, required: true },
      Tenure: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Resume', resumeSchema);
