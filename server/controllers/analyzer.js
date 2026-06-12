import { analyzeProjectIdea } from '../services/geminiService.js';

/**
 * Controller handler for project idea analysis requests.
 * Route: POST /api/analyze-project
 * Body: { projectIdea: string }
 */
export async function handleAnalyzeProject(req, res) {
  const { projectIdea } = req.body;

  // Validate presence of project idea
  if (!projectIdea || typeof projectIdea !== 'string' || !projectIdea.trim()) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'The parameter "projectIdea" is required and must be a non-empty string.'
    });
  }

  try {
    const analysisReport = await analyzeProjectIdea(projectIdea);
    
    // Return structured analysis output matching requirements
    res.json({
      success: true,
      analysis: analysisReport
    });
  } catch (error) {
    console.error('Error in handleAnalyzeProject controller:', error);
    
    res.status(500).json({
      error: 'Analysis Failed',
      message: error.message || 'An internal error occurred during Gemini project analysis.'
    });
  }
}
