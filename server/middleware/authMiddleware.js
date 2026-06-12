import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "derisk_ai_secret_token_key_2026";

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No authentication token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Access denied. Authentication token is empty." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({ error: "Access token is invalid or has expired." });
  }
}
