import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rdn-manager';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@rdn.com' });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashed = await bcrypt.hash('admin123', 12);
    await User.create({
      name: 'Project Manager',
      email: 'admin@rdn.com',
      password: hashed,
      role: 'PM',
      isActive: true,
    });

    console.log('✅ Admin user seeded: admin@rdn.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
