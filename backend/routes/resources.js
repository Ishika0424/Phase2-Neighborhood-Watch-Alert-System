const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect } = require('../middleware/auth');

// @route   GET api/resources
// @desc    Get all resources (with search and filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, location } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const resources = await Resource.find(query)
      .populate('owner', 'name email phone')
      .populate('borrowedBy', 'name email phone')
      .populate('requests', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/resources
// @desc    Create a new resource listing
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, description, category, location } = req.body;

  if (!name || !description || !category || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const resource = await Resource.create({
      owner: req.user.id,
      name,
      description,
      category,
      location,
      availabilityStatus: 'Available'
    });

    const populatedResource = await Resource.findById(resource._id).populate('owner', 'name email phone');
    res.status(201).json(populatedResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/resources/:id
// @desc    Get single resource details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('borrowedBy', 'name email phone')
      .populate('requests', 'name email phone');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT api/resources/:id
// @desc    Update resource details
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check ownership
    if (resource.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this resource' });
    }

    resource.name = req.body.name || resource.name;
    resource.description = req.body.description || resource.description;
    resource.category = req.body.category || resource.category;
    resource.location = req.body.location || resource.location;
    resource.availabilityStatus = req.body.availabilityStatus || resource.availabilityStatus;

    const updatedResource = await resource.save();
    const populated = await Resource.findById(updatedResource._id)
      .populate('owner', 'name email phone')
      .populate('borrowedBy', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE api/resources/:id
// @desc    Delete a resource listing
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check ownership
    if (resource.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this resource' });
    }

    await Resource.deleteOne({ _id: req.params.id });
    res.json({ message: 'Resource removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/resources/:id/request
// @desc    Submit a request to borrow a resource (or cancel it if already requested)
// @access  Private
router.post('/:id/request', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot request your own resource' });
    }

    if (resource.availabilityStatus === 'Borrowed') {
      return res.status(400).json({ message: 'Resource is currently borrowed' });
    }

    const index = resource.requests.indexOf(req.user.id);
    if (index >= 0) {
      // Cancel request
      resource.requests.splice(index, 1);
      if (resource.requests.length === 0 && resource.availabilityStatus === 'Requested') {
        resource.availabilityStatus = 'Available';
      }
    } else {
      // Add request
      resource.requests.push(req.user.id);
      resource.availabilityStatus = 'Requested';
    }

    await resource.save();
    const populated = await Resource.findById(resource._id)
      .populate('owner', 'name email phone')
      .populate('requests', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/resources/:id/approve
// @desc    Approve a request to borrow (assign to a specific requester)
// @access  Private
router.post('/:id/approve', protect, async (req, res) => {
  const { requesterId } = req.body;

  if (!requesterId) {
    return res.status(400).json({ message: 'Requester ID is required' });
  }

  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!resource.requests.includes(requesterId)) {
      return res.status(400).json({ message: 'User has not requested this resource' });
    }

    resource.availabilityStatus = 'Borrowed';
    resource.borrowedBy = requesterId;
    resource.requests = []; // Clear other requests

    await resource.save();
    const populated = await Resource.findById(resource._id)
      .populate('owner', 'name email phone')
      .populate('borrowedBy', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/resources/:id/return
// @desc    Return a borrowed resource (make it available again)
// @access  Private
router.post('/:id/return', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Allow owner or borrower to return
    const isOwner = resource.owner.toString() === req.user.id;
    const isBorrower = resource.borrowedBy && resource.borrowedBy.toString() === req.user.id;

    if (!isOwner && !isBorrower) {
      return res.status(401).json({ message: 'Not authorized to return this resource' });
    }

    resource.availabilityStatus = 'Available';
    resource.borrowedBy = null;
    resource.requests = [];

    await resource.save();
    const populated = await Resource.findById(resource._id)
      .populate('owner', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
