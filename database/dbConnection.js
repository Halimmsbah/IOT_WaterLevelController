import mongoose from 'mongoose';

export const dbConnection = async () => {
  mongoose.connect(process.env.DB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
};
