import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const dbUri = process.env.MONGO_URI || "mongodb://localhost:27017/notemind";
    
    // Connect to MongoDB
    const conn = await mongoose.connect(dbUri);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;