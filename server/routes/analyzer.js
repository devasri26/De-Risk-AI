import express from 'express';
import { handleAnalyzeProject } from '../controllers/analyzer.js';

const router = express.Router();

/**
 * Route: POST /analyze-project
 * Description: Endpoint to trigger Gemini analysis for an AI project idea
 */
router.post('/analyze-project', handleAnalyzeProject);

export default router;
