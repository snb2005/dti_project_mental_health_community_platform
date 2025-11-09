import mongoose from 'mongoose';
import User from '../models/usermodel.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const makeAdmin = async () => {
  try {
    // Connect to MongoDB using environment variable
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");

    // Get email from command line arguments or use default
    const email = process.argv[2] || 'sankalpbrahmapurkar2005@gmail.com';
    
    console.log(`Looking for user with email: ${email}`);

    // Find user by email
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log("User not found, creating new admin user...");
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      user = new User({
        name: 'Admin',
        email: email,
        password: hashedPassword,
        role: 'admin',
        isAccountVerified: true
      });
      
      await user.save();
      console.log(`Created new admin user with email: ${email}`);
      console.log('Default password: admin123');
      console.log('Please change the password after first login.');
    } else {
      // Update existing user to admin
      user.role = 'admin';
      user.isAccountVerified = true; // Make sure admin is verified
      await user.save();
      console.log(`Successfully made ${email} an admin`);
    }
    
    // Display user info
    console.log('\nAdmin User Details:');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Verified: ${user.isAccountVerified}`);
    
    process.exit(0);

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

makeAdmin(); 