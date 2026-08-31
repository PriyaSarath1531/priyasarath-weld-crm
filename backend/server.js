const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/weldcrm')
.then(async () => {
  console.log('MongoDB connected');
  try {
    await User.collection.dropIndex('contactNumber_1');
    console.log('Removed obsolete contactNumber index');
  } catch (error) {
    if (error.code !== 27) console.error('Unable to remove obsolete contactNumber index:', error.message);
  }
})
.catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/finance', require('./routes/finance'));

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;