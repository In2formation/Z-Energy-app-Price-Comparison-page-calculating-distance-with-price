import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/db.js";   
import stationRoutes from "./api.js";
// import "./db/seedStationInfo.js";



dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Routes
app.use("/api/stations", stationRoutes);

// Health
app.get("/", (req, res) => {
  res.send(" Z Energy Locator API is running");
});

// Server start
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

