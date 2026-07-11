const express = require('express');
const Expense = require('../models/Expense');
const Job = require('../models/Job');

const router = express.Router();

// Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create expense
router.post('/expenses', async (req, res) => {
  const expense = new Expense(req.body);
  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get monthly finance summary
router.get('/summary/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await Expense.find({
      date: { $gte: startDate, $lt: endDate }
    });

    const jobs = await Job.find({
      status: 'Completed',
      createdAt: { $gte: startDate, $lt: endDate }
    });

    const totalIncome = jobs.reduce((sum, job) => sum + job.totalCost, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      profit,
      expenses,
      jobs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;