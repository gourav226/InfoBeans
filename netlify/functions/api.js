const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gourav289';
const JWT_SECRET = process.env.JWT_SECRET || 'infobeans-secret-key-2026';

let cachedDb = null;

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 8000
    });
    cachedDb = conn;
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  businessName: { type: String, required: true },
  description: { type: String, required: true },
  communicationMethod: { type: String, required: true },
  projectType: { type: String, required: true },
  pages: { type: Number, required: true },
  features: [String],
  timeline: { type: String, required: true },
  estimatedCost: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['New Lead', 'Contacted', 'In Discussion', 'Proposal Sent', 'Won', 'Lost'],
    default: 'New Lead'
  }
}, { timestamps: true });

let Project = null;

function getProjectModel() {
  if (!Project) {
    Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
  }
  return Project;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: 'Invalid password' });
});

app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ success: true, message: 'API is running', db: dbStatus });
});

app.post('/api/projects', async (req, res) => {
  try {
    await connectDB();
    const Model = getProjectModel();
    const project = new Model(req.body);
    const saved = await project.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Create project error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const Model = getProjectModel();
    const { search, status, page = '1', limit = '200' } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { businessName: regex },
        { projectType: regex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      Model.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Model.countDocuments(query)
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('List projects error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const Model = getProjectModel();
    const project = await Model.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const Model = getProjectModel();
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const validStatuses = ['New Lead', 'Contacted', 'In Discussion', 'Proposal Sent', 'Won', 'Lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const project = await Model.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const Model = getProjectModel();
    const project = await Model.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

module.exports.handler = serverless(app);
