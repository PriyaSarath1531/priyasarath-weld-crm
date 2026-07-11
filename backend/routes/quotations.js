const express = require('express');
const Quotation = require('../models/Quotation');
const Job = require('../models/Job');

const router = express.Router();

// Get all quotations
router.get('/', async (req, res) => {
  try {
    const quotations = await Quotation.find().populate('customer');
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create quotation
router.post('/', async (req, res) => {
  const quotation = new Quotation(req.body);
  try {
    const newQuotation = await quotation.save();
    res.status(201).json(newQuotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update quotation
router.put('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Convert quotation to job
router.post('/:id/convert', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const job = new Job({
      customer: quotation.customer,
      workType: quotation.workDetails,
      totalCost: quotation.estimatedCost,
      startDate: new Date(),
    });

    const newJob = await job.save();
    quotation.status = 'Accepted';
    await quotation.save();

    res.json(newJob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete quotation
router.delete('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;