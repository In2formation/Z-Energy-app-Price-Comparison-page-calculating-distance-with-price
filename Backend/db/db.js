import mongoose from "mongoose";

// Centralized async function to connect to MongoDB
const connectDB = async () => {
  try {
    // Use environment variable for URI so credentials/config 
    // aren’t hardcoded — safer and more flexible across environments.
    await mongoose.connect(process.env.MONGO_URI);

    // Log success so developers know the DB connection is established.
    console.log("MongoDB connected");
  } catch (err) {
    // Catch errors to prevent silent failures and provide visibility.
    console.error("MongoDB connection error:", err);

    // Exit process if DB connection fails — prevents app from running 
    // in a broken state where DB-dependent features would crash later.
    process.exit(1);
  }
};

export default connectDB;
