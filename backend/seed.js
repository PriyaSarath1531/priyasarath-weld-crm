const mongoose = require('mongoose');
require('dotenv').config();

const Customer = require('./models/Customer');
const Job = require('./models/Job');
const Expense = require('./models/Expense');

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  // Sample customers
  const customers = await Customer.insertMany([
    { name: 'John Doe', phone: '1234567890', address: '123 Main St' },
    { name: 'Jane Smith', phone: '0987654321', address: '456 Elm St' },
  ]);

  // Sample jobs
  await Job.insertMany([
    {
      customer: customers[0]._id,
      workType: 'Gate Welding',
      materialDetails: 'Iron rods',
      totalCost: 500,
      advancePaid: 200,
      startDate: new Date(),
      status: 'In Progress'
    },
    {
      customer: customers[1]._id,
      workType: 'Grill Repair',
      materialDetails: 'Steel mesh',
      totalCost: 300,
      advancePaid: 150,
      startDate: new Date(),
      status: 'Completed'
    },
  ]);

  // Sample expenses
  await Expense.insertMany([
    { description: 'Material purchase', amount: 100, category: 'Material' },
    { description: 'Transport', amount: 50, category: 'Transport' },
  ]);

  console.log('Sample data seeded');
  process.exit();
};

seedData();