import express from "express";
import { analyzeProject } from "../services/openrouterService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/analyze", authMiddleware, async (req, res) => {
    try {
        const { idea } = req.body;

        if (!idea) {
            return res.status(400).json({ error: "Idea required" });
        }

        const result = await analyzeProject(idea);

        res.json(result);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "AI failed",
            details: err.message,
        });
    }
});

export default router;