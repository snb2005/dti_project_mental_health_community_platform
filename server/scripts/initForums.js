import mongoose from 'mongoose';
import { Room } from '../models/forumModel.js';
import dotenv from 'dotenv';

dotenv.config();

const mentalHealthForums = [
  {
    name: "Anxiety Support Circle",
    description: "A safe space to share experiences, coping strategies, and support each other through anxiety challenges. Whether dealing with generalized anxiety, panic attacks, or social anxiety, you're not alone here.",
    type: "ANXIETY_SUPPORT",
    category: "Mental Wellness",
    icon: "🧘",
    color: "#10B981",
    memberCount: 0
  },
  {
    name: "Depression Recovery Community",
    description: "Connect with others on their journey through depression. Share your story, find hope, and discover practical tools for healing and recovery in a compassionate environment.",
    type: "DEPRESSION_HELP", 
    category: "Support Groups",
    icon: "🌱",
    color: "#3B82F6",
    memberCount: 0
  },
  {
    name: "Wellness & Lifestyle Hub",
    description: "Focus on building healthy habits, mindfulness practices, self-care routines, and lifestyle changes that support mental wellbeing. Celebrate small wins and motivate each other!",
    type: "WELLNESS_LIFESTYLE",
    category: "Mental Wellness", 
    icon: "✨",
    color: "#8B5CF6",
    memberCount: 0
  }
];

async function initializeForums() {
  try {
    console.log('Connecting to database...');
    
    // Connect to MongoDB with proper settings
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10
    });
    
    console.log('✅ Database connected successfully!');
    console.log('Initializing mental health forums...');
    
    for (const forumData of mentalHealthForums) {
      // Check if forum already exists
      const existingForum = await Room.findOne({ type: forumData.type });
      
      if (existingForum) {
        console.log(`✅ Forum "${forumData.name}" already exists`);
      } else {
        // Create new forum
        const forum = new Room(forumData);
        await forum.save();
        console.log(`✨ Created forum: "${forumData.name}"`);
      }
    }
    
    // Display all forums
    console.log('\n📋 Current Forums:');
    const allForums = await Room.find().sort({ category: 1, createdAt: 1 });
    
    allForums.forEach(forum => {
      console.log(`${forum.icon} ${forum.name}`);
      console.log(`   Category: ${forum.category}`);
      console.log(`   Description: ${forum.description}`);
      console.log(`   Members: ${forum.memberCount}`);
      console.log('');
    });
    
    console.log('✅ Mental health forums initialized successfully!');
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error initializing forums:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

initializeForums();