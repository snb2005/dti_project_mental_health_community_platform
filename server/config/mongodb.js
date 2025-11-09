import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log("Connecting to database:", process.env.MONGO_URI?.substring(0, 20) + "...");
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database Connected Successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1); // Exit the process if DB connection fails
    }
};

export default connectDB                                                                                                                                                                                