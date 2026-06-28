const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const { protect } = require('../middleware/auth');

// @route   GET api/skills
// @desc    Get all skills / services (with search and filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skills = await Skill.find(query)
      .populate('owner', 'name email phone locationName')
      .populate('requests.user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/skills
// @desc    Create a new skill / service listing
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, category, availability } = req.body;

  if (!title || !description || !category || !availability) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const skill = await Skill.create({
      owner: req.user.id,
      title,
      description,
      category,
      availability
    });

    const populatedSkill = await Skill.findById(skill._id).populate('owner', 'name email phone');
    res.status(201).json(populatedSkill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/skills/:id
// @desc    Get single skill details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('owner', 'name email phone locationName')
      .populate('requests.user', 'name email phone');

    if (!skill) {
      return res.status(404).json({ message: 'Skill listing not found' });
    }

    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT api/skills/:id
// @desc    Update a skill listing
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill listing not found' });
    }

    // Check ownership
    if (skill.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this listing' });
    }

    skill.title = req.body.title || skill.title;
    skill.description = req.body.description || skill.description;
    skill.category = req.body.category || skill.category;
    skill.availability = req.body.availability || skill.availability;

    const updatedSkill = await skill.save();
    const populated = await Skill.findById(updatedSkill._id)
      .populate('owner', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE api/skills/:id
// @desc    Delete a skill listing
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill listing not found' });
    }

    // Check ownership
    if (skill.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this listing' });
    }

    await Skill.deleteOne({ _id: req.params.id });
    res.json({ message: 'Skill listing removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/skills/:id/request
// @desc    Request help / contact owner of the skill listing
// @access  Private
router.post('/:id/request', protect, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Please add a message with your request' });
  }

  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill listing not found' });
    }

    if (skill.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot request your own skill listing' });
    }

    // Create a new request object
    const newRequest = {
      user: req.user.id,
      message,
      status: 'Pending'
    };

    skill.requests.push(newRequest);
    await skill.save();

    const populated = await Skill.findById(skill._id)
      .populate('owner', 'name email phone')
      .populate('requests.user', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT api/skills/:id/requests/:requestId
// @desc    Accept or Decline a request
// @access  Private
router.put('/:id/requests/:requestId', protect, async (req, res) => {
  const { status } = req.body; // Accepted or Declined

  if (!status || !['Accepted', 'Declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill listing not found' });
    }

    if (skill.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to manage these requests' });
    }

    const request = skill.requests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    await skill.save();

    const populated = await Skill.findById(skill._id)
      .populate('owner', 'name email phone')
      .populate('requests.user', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
