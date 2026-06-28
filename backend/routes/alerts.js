const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// @route   GET api/alerts
// @desc    Get all alerts (with search/filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, severity, status } = req.query;
    let query = {};

    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const alerts = await Alert.find(query)
      .populate('reporter', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/alerts/analytics
// @desc    Get aggregated alert statistics
// @access  Public
router.get('/analytics', async (req, res) => {
  try {
    const totalCount = await Alert.countDocuments();
    
    // Aggregation for categories
    const categoriesData = await Alert.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Aggregation for severities
    const severitiesData = await Alert.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Aggregation for statuses
    const statusesData = await Alert.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalCount,
      categories: categoriesData.map(c => ({ name: c._id, count: c.count })),
      severities: severitiesData.map(s => ({ name: s._id, count: s.count })),
      statuses: statusesData.map(st => ({ name: st._id, count: st.count }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/alerts
// @desc    Create a new neighborhood safety alert & broadcast it
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, category, severity, latitude, longitude, locationName } = req.body;

  if (!title || !description || !category || !severity || latitude === undefined || longitude === undefined || !locationName) {
    return res.status(400).json({ message: 'All alert fields are required' });
  }

  try {
    const alert = await Alert.create({
      reporter: req.user.id,
      title,
      description,
      category,
      severity,
      latitude,
      longitude,
      locationName,
      status: 'Active'
    });

    const populatedAlert = await Alert.findById(alert._id).populate('reporter', 'name email phone');

    // Broadcast through socket.io if initialized
    const io = req.app.get('io');
    if (io) {
      io.emit('newAlert', populatedAlert);
    }

    res.status(201).json(populatedAlert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/alerts/:id
// @desc    Get alert details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('reporter', 'name email phone');
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT api/alerts/:id/status
// @desc    Update alert status (Active, Investigating, Resolved)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;

  if (!status || !['Active', 'Investigating', 'Resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.status = status;
    const updatedAlert = await alert.save();
    const populated = await Alert.findById(updatedAlert._id).populate('reporter', 'name email phone');

    // Broadcast status change through socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('updateAlert', populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE api/alerts/:id
// @desc    Delete alert
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Allow reporter or admin (if available) to delete
    if (alert.reporter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this alert' });
    }

    await Alert.deleteOne({ _id: req.params.id });

    // Broadcast delete event
    const io = req.app.get('io');
    if (io) {
      io.emit('deleteAlert', req.params.id);
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
