const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  workType: { type: String, required: true },
  materialDetails: { type: String },
  totalCost: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: function() { return this.totalCost - this.advancePaid; } },
  startDate: { type: Date, required: true },
  deliveryDate: { type: Date },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);