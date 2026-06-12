import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' folder
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);

const PORT = 5001;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});