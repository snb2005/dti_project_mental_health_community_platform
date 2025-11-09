import mongoose from 'mongoose';
import { Room } from '../models/forumModel.js';

const MONGO_URI = "mongodb+srv://jack:jack@cluster0.xjckq.mongodb.net/GSC";

const rooms = [
  {
    name: 'Child Abuse Support',
    description: 'A safe space to discuss and seek support for child abuse-related issues.',
    type: 'CHILD_ABUSE'
  },
  {
    name: 'Domestic Abuse Support',
    description: 'Support group for those affected by domestic abuse.',
    type: 'DOMESTIC_ABUSE'
  },
  {
    name: 'Workplace Abuse Support',
    description: 'Discussion and support for workplace abuse and harassment.',
    type: 'WORKPLACE_ABUSE'
  }
];

async function initRooms() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');

    // Create new rooms
    const createdRooms = await Room.create(rooms);
    console.log('Created rooms:', createdRooms);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initRooms();