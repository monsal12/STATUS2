// import mongoose from 'mongoose'; // Removed duplicate import
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

// Get the MongoDB URI from environment variables
const mongoURI = process.env.MONGODB_URI;

// Function to connect to MongoDB
export const connectDB = async () => {
    if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined in .env');
    }

    try {
        await mongoose.connect(mongoURI, {
            // Uncomment the line below if you want to use unified topology
            // useUnifiedTopology: true,
            readPreference: 'primaryPreferred', // Read from primary or secondary
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

import mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    hunger: { type: Number, default: 50 },
    thirst: { type: Number, default: 50 },
    tiredness: { type: Number, default: 50 },
    sleepiness: { type: Number, default: 50 },
    isResting: { type: Boolean, default: false },
    isSleeping: { type: Boolean, default: false },
    lastEat: { type: Date, default: Date.now },
    hasNotifiedRest: { type: Boolean, default: false }, 
    hasNotifiedSleep: { type: Boolean, default: false }, // Duplicate key
    lastDrink: { type: Date, default: Date.now }
});

// Create the User model
export const User = mongoose.model('User', userSchema);
