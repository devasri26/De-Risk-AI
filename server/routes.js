import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculatePrediction } from './utils/predictor.js';

const router = express.Router();

// Setup paths for __dirname compatibility in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'predictions.json');

// Helper to read predictions JSON file
async function readPredictions() {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, create it with empty list
        await fs.writeFile(DATA_FILE, JSON.stringify([]), 'utf8');
        return [];
      }
      throw err;
    }
  } catch (err) {
    console.error('Error reading JSON DB file:', err);
    return [];
  }
}

// Helper to write predictions JSON file
async function writePredictions(data) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to JSON DB file:', err);
  }
}

/**
 * Route: POST /api/predict
 * Body: { projectName, answers }
 * Description: Run predictor engine and get failure risk analysis
 */
router.post('/predict', (req, res) => {
  const { projectName, answers } = req.body;
  
  if (!answers) {
    return res.status(400).json({ error: 'Answers are required for prediction calculation.' });
  }

  try {
    const prediction = calculatePrediction(projectName, answers);
    res.json(prediction);
  } catch (err) {
    console.error('Prediction calculation failed:', err);
    res.status(500).json({ error: 'Failed to calculate failure risk assessment.' });
  }
});

/**
 * Route: GET /api/history
 * Description: Fetch list of all saved predictions sorted by timestamp descending
 */
router.get('/history', async (req, res) => {
  try {
    const predictions = await readPredictions();
    // Sort descending by timestamp
    const sorted = [...predictions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sorted);
  } catch (err) {
    console.error('Failed to retrieve history:', err);
    res.status(500).json({ error: 'Failed to retrieve prediction history.' });
  }
});

/**
 * Route: POST /api/history
 * Body: Prediction assessment data
 * Description: Save an assessment record to history
 */
router.post('/history', async (req, res) => {
  const predictionResult = req.body;

  if (!predictionResult || typeof predictionResult !== 'object') {
    return res.status(400).json({ error: 'Invalid prediction result payload.' });
  }

  try {
    const predictions = await readPredictions();
    
    // Add unique ID and ensure timestamp exists
    const record = {
      ...predictionResult,
      id: predictionResult.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: predictionResult.timestamp || new Date().toISOString()
    };

    predictions.push(record);
    await writePredictions(predictions);
    
    res.status(201).json(record);
  } catch (err) {
    console.error('Failed to save assessment to history:', err);
    res.status(500).json({ error: 'Failed to persist assessment.' });
  }
});

/**
 * Route: DELETE /api/history/:id
 * Description: Remove a prediction from history
 */
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const predictions = await readPredictions();
    const updated = predictions.filter(p => p.id !== id);

    if (predictions.length === updated.length) {
      return res.status(404).json({ error: 'Prediction record not found.' });
    }

    await writePredictions(updated);
    res.json({ success: true, message: 'Assessment record deleted successfully.' });
  } catch (err) {
    console.error('Failed to delete history record:', err);
    res.status(500).json({ error: 'Failed to delete prediction record.' });
  }
});

export default router;
