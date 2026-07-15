const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'infobeans-secret-key-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gourav289';

const app = express();
app.use(cors({
  origin: ['http://localhost:8888', 'http://localhost:5000', 'https://infobeans.netlify.app', 'https://inspiring-turing-8a0f2c.netlify.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const leadSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['project_inquiry', 'job_application', 'contact', 'quote_request'],
    required: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  businessName: { type: String },
  communicationMethod: { type: String },
  description: { type: String },
  projectType: { type: String },
  pages: { type: Number },
  features: [String],
  timeline: { type: String },
  estimatedCost: {
    min: { type: Number },
    max: { type: Number }
  },
  role: { type: String },
  resumeName: { type: String },
  resumeSize: { type: String },
  resumeData: { type: String },
  subject: { type: String },
  message: { type: String },
  serviceType: { type: String },
  packageName: { type: String },
  source: { type: String, default: '' },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Discussion', 'Proposal Sent', 'Won', 'Lost', 'Archived'],
    default: 'New'
  },
  adminNotes: { type: String }
}, { timestamps: true });

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    jwt.verify(header.split(' ')[1], JWT_SECRET);
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

app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Token valid' });
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ success: true, message: 'Server running', db: dbState, time: new Date().toISOString() });
});

app.post('/api/leads', async (req, res) => {
  try {
    const { type, name, email } = req.body;
    if (!type || !name || !email) {
      return res.status(400).json({ success: false, message: 'type, name, and email are required' });
    }
    const validTypes = ['project_inquiry', 'job_application', 'contact', 'quote_request'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }
    const lead = new Lead(req.body);
    const saved = await lead.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Create lead error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

app.get('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { search, status, type, page = '1', limit = '200' } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { businessName: regex },
        { projectType: regex },
        { role: regex },
        { subject: regex },
        { serviceType: regex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Lead.countDocuments(query)
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
    console.error('List leads error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/leads/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/leads/:id', authMiddleware, async (req, res) => {
  try {
    const allowed = ['status', 'adminNotes'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.status) {
      const valid = ['New', 'Contacted', 'In Discussion', 'Proposal Sent', 'Won', 'Lost', 'Archived'];
      if (!valid.includes(updates.status)) {
        return res.status(400).json({ success: false, message: `Invalid status` });
      }
    }
    const lead = await Lead.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/leads/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [total, newLeads, todayLeads, typeCounts, recent] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'New' }),
      Lead.countDocuments({ createdAt: { $gte: todayStart } }),
      Lead.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Lead.find().sort({ createdAt: -1 }).limit(10).select('name type status createdAt')
    ]);

    const statusPipeline = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalLeads: total,
        newLeads,
        todayLeads,
        typeBreakdown: typeCounts.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
        statusBreakdown: statusPipeline.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        recentActivities: recent
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
