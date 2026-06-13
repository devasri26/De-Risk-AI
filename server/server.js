import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static assets from 'public' folder (excluding default index.html override if any)
app.use(express.static("public"));

// Clean routes for frontend pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/analyze", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);

const PORT = 5001;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});