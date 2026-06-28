import React, { useState } from 'react';
import IdeaForm from './components/IdeaForm';
import AnalysisResult from './components/AnalysisResult';
import Auth from './components/Auth';
import { analyzeProject } from './services/api';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const handleAnalyzeIdea = async (ideaText) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Direct integration call to backend Express API via Axios service
      const resultData = await analyzeProject(ideaText);
      setAnalysisResult(resultData);
    } catch (err) {
      console.error('Project feasibility audit failed:', err);
      setError(err.message || 'Server encountered an issue during Gemini processing. Please retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="app-wrapper">

      {/* Header component */}
      <header className="header-bar">
        <div className="logo-group" onClick={handleReset} style={{ cursor: 'pointer' }}>
          <div className="logo-cube">
            {/* Visual AI warning logo representation */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className="logo-title">AI Project Failure Predictor</h1>
            <div className="logo-subtitle">Risk Diagnostic Console</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#e5e7eb' }}>{user.email}</span>
              <button 
                onClick={handleSignOut} 
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  color: '#ef4444', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
          <div>
            STATUS: <span style={{ color: 'var(--emerald-color)' }}>● ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {!user ? (
          <Auth onAuthSuccess={(userData) => setUser(userData)} />
        ) : (
          <>
            {/* Error Alert panel */}
            {error && (
              <div className="error-box">
                <div className="error-message">
                  <strong>Audit Error:</strong> {error}
                </div>
                <button className="btn-dismiss" onClick={() => setError(null)}>
                  Dismiss
                </button>
              </div>
            )}

            {/* Loading Spinner Panel */}
            {isAnalyzing && (
              <div className="glass-card loader-wrapper">
                <div className="spinner-ring" />
                <h3 className="loader-text">Analyzing Concept</h3>
                <p className="loader-sub">
                  Connecting with Google Gemini nodes to identify failure triggers, data bottlenecks, and compute limitations...
                </p>
              </div>
            )}

            {/* Input Form Section */}
            {!analysisResult && !isAnalyzing && (
              <IdeaForm onSubmit={handleAnalyzeIdea} isAnalyzing={isAnalyzing} />
            )}

            {/* Report Output Section */}
            {analysisResult && !isAnalyzing && (
              <AnalysisResult result={analysisResult} onReset={handleReset} />
            )}
          </>
        )}

      </main>

      {/* Footer component */}
      <footer style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-dim)', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <p>© 2026 AI Failure Predictor. Portfolio-quality diagnostic panel.</p>
      </footer>

    </div>
  );
}

