import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  address: {
    type: String,
  }, 
  transactionHash: {
    type: String,
  }, 
  network: {
    type: String,
  },
}, {
  timestamps: false,
  versionKey: false
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);