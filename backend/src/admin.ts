// adminInit.ts
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
// import dotenv from 'dotenv';

// dotenv.config();

// Admin interface and schema (moved from your original code)
interface IAdmin extends Document {
  email: string;
  password: string;
}

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

// Function to initialize admin
async function initializeAdmin() {
  try {
    // ');Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '')

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      console.log('Admin account already exists');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'defaultAdminPass', 10);

    // Create admin user
    const admin = new Admin({
      email: process.env.ADMIN_EMAIL || '',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin account created successfully');
    
  } catch (error) {
    console.error('Error initializing admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the initialization
initializeAdmin();