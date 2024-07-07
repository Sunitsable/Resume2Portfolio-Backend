const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const parseResumeDataWithLLM = async (text) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Extract the following information from the resume text and format it as a JSON object with these exact keys:
    {
      "name": "Full Name",
      
      "contact": {
        "phone": "Phone Number",
        "email": "Email Address",
        "links": ["links List"]
      },
      "education": [
        {
          "College/school": "College/school name",
          "Scores": "score with type of score like cgpa, %",
          "Tenure": "Time spent there"
        }
      ],
      "projects": [
        {
          "title": "Project Title",
          "description": "Project Description",
          "techStack": ["Tech Stack"],
          "link": "Project Link"
        }
      ],
      "skills": ["Skill list"],
      "experience": [
        {
          "Role": "role played",
          "Company": "Company / work place name",
          "Tenure": "time spent there"
        }
      ]
    }

    Ensure all fields are filled. If information is not available, do not display that field ,leave it blank

    Resume text:
    ${text}

    Return only the JSON object without any additional text or formatting.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '');

    console.log('Cleaned response text:', cleanedText);

    let parsedData = JSON.parse(cleanedText);

    const requiredFields = ['name', 'address', 'contact', 'education', 'projects', 'skills', 'experience'];
    for (const field of requiredFields) {
      if (!parsedData[field] || parsedData[field] === "Not provided") {
        parsedData[field] = "Information not available";
      }
    }

    if (typeof parsedData.contact === 'string') {
      const contactParts = parsedData.contact.split('\n').filter(Boolean);
      parsedData.contact = {
        phone: contactParts[0] || 'Information not available',
        email: contactParts[1] || 'Information not available',
        links: contactParts.slice(2) || []
      };
    }

    if (typeof parsedData.skills === 'string') {
      parsedData.skills = parsedData.skills.split(',').map(skill => skill.trim());
    }

    if (!Array.isArray(parsedData.education)) {
      parsedData.education = [];
    }
    parsedData.education = parsedData.education.map(edu => ({
      College: edu['College/school']?.replace(/\n/g, ' ').trim() || 'Information not available',
      Scores: edu['Scores']?.replace(/\n/g, ' ').trim() || 'Information not available',
      Tenure: edu['Tenure']?.replace(/\n/g, ' ').trim() || 'Information not available'
    }));

    if (!Array.isArray(parsedData.projects)) {
      parsedData.projects = [];
    }
    parsedData.projects = parsedData.projects.map(proj => ({
      title: proj['title']?.replace(/\n/g, ' ').trim() || 'Information not available',
      description: proj['description']?.replace(/\n/g, ' ').trim() || 'Information not available',
      techStack: proj['techStack'] || [],
      link: proj['link']?.replace(/\n/g, ' ').trim() || 'Information not available'
    }));

    if (!Array.isArray(parsedData.experience)) {
      parsedData.experience = [];
    }
    parsedData.experience = parsedData.experience.map(exp => ({
      Role: exp['Role']?.replace(/\n/g, ' ').trim() || 'Information not available',
      Company: exp['Company']?.replace(/\n/g, ' ').trim() || 'Information not available',
      Tenure: exp['Tenure']?.replace(/\n/g, ' ').trim() || 'Information not available'
    }));

    return parsedData;
  } catch (error) {
    console.error('Error generating or parsing content:', error);
    throw new Error(`Failed to parse resume data: ${error.message}`);
  }
};

exports.uploadResume = async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from the request body

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    const resumeData = await parseResumeDataWithLLM(data.text);

    // Associate the resume with the user
    resumeData.user = userId; // Add the userId to the resume data

    console.log('Parsed resume data:', JSON.stringify(resumeData, null, 2));

    const resume = new Resume(resumeData);
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    console.error('Error in uploadResume:', error);
    if (error.name === 'ValidationError') {
      res.status(422).json({ error: 'Resume validation failed', details: error.message });
    } else if (error.message.includes('Failed to parse resume data')) {
      res.status(422).json({ error: 'Invalid resume format or content', details: error.message });
    } else {
      res.status(500).json({ error: 'Server error while processing resume', details: error.message });
    }
  }
};

exports.getResumes = async (req, res) => {
  try {
    const { userId } = req.query; // Extract userId from the query parameters

    const latestResume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });

    if (!latestResume) {
      return res.status(404).json({ error: 'No resume found for this user' });
    }

    res.status(200).json(latestResume);
  } catch (error) {
    console.error('Error in getResumes:', error);
    res.status(500).json({ error: 'Server error while fetching resume', details: error.message });
  }
};
