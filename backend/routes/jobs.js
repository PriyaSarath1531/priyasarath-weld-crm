const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('customer');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('customer');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create job
router.post('/', async (req, res) => {
  const job = new Job(req.body);
  job.balanceAmount = job.totalCost - job.advancePaid;
  try {
    const newJob = await job.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update job
router.put('/:id', async (req, res) => {
  try {
    const updateData = req.body;
    if (updateData.totalCost !== undefined || updateData.advancePaid !== undefined) {
      const job = await Job.findById(req.params.id);
      if (job) {
        updateData.balanceAmount = (updateData.totalCost || job.totalCost) - (updateData.advancePaid || job.advancePaid);
      }
    }
    const job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('customer');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;