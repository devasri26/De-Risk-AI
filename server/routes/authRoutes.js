import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, "../data/users.json");
const JWT_SECRET = process.env.JWT_SECRET || "derisk_ai_secret_token_key_2026";

// Helper to read users list from JSON file
async function readUsers() {
  try {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    try {
      const data = await fs.readFile(USERS_FILE, "utf8");
      return JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.writeFile(USERS_FILE, JSON.stringify([]), "utf8");
        return [];
      }
      throw err;
    }
  } catch (err) {
    console.error("Error reading users file:", err);
    return [];
  }
}

// Helper to write users list to JSON file
async function writeUsers(users) {
  try {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing users file:", err);
  }
}

/**
 * Route: POST /api/auth/signup
 * Body: { email, password }
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const users = await readUsers();
    
    // Check if user already exists
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeUsers(users);

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

/**
 * Route: POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = await readUsers();
    
    // Find the user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Sign JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to log in" });
  }
});

export default router;
