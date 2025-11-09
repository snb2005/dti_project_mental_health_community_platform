import mongoose from 'mongoose';
import User from '../models/usermodel.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");

    // Find the admin user
    const admin = await User.findOne({ email: 'sankalpbrahmapurkar2005@gmail.com' });
    
    if (admin) {
      console.log("\n✅ Admin user found!");
      console.log("📧 Email:", admin.email);
      console.log("👤 Name:", admin.name);
      console.log("🔑 Role:", admin.role);
      console.log("✔️ Verified:", admin.isAccountVerified);
      console.log("🆔 User ID:", admin._id);
    } else {
      console.log("\n❌ Admin user NOT found in database");
    }
    
    // Check total users in database
    const totalUsers = await User.countDocuments();
    console.log("\n📊 Total users in database:", totalUsers);
    
    // List all users
    const allUsers = await User.find({}, 'name email role isAccountVerified');
    console.log("\n👥 All users in database:");
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}, Verified: ${user.isAccountVerified}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkAdmin();