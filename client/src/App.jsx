import React, { useState, useEffect } from 'react';
import IdeaForm from './components/IdeaForm';
import AnalysisResult from './components/AnalysisResult';
import Auth from './components/Auth';
import { analyzeProject } from './services/api';

function StepLoader() {
  const [step, setStep] = useState(0);
  const steps = [
    "Analyzing project scope and architecture...",
    "Evaluating database scaling parameters...",
    "Checking technical integration triggers...",
    "Mapping mitigation matrices and SWOT grids...",
    "Computing budget and timeline heuristics..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card loader-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3.5rem 2rem', width: '100%' }}>
      <div className="spinner-ring" style={{ width: '40px', height: '40px', borderWidth: '3px', borderTopColor: 'var(--primary-color)' }} />
      <h3 className="loader-text" style={{ fontSize: '1.2rem', fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>Feasibility Audit Pipeline</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.5rem', maxWidth: '320px', width: '100%' }}>
        {steps.map((text, idx) => {
          const isDone = idx < step;
          const isActive = idx === step;
          return (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.82rem', color: isDone ? 'var(--emerald-color)' : (isActive ? 'var(--text-bright)' : 'var(--text-muted)'), opacity: isDone ? 0.7 : (isActive ? 1 : 0.4), transition: 'all 0.25s ease', textAlign: 'left' }}>
              <span style={{ fontWeight: 800 }}>{isDone ? '✓' : (isActive ? '●' : '○')}</span>
              <span style={{ fontWeight: isActive ? '600' : 'normal' }}>{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('audit_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = ((e.clientX / window.innerWidth) * 100).toFixed(2);
      const y = ((e.clientY / window.innerHeight) * 100).toFixed(2);
      document.documentElement.style.setProperty("--mouse-x", `${x}%`);
      document.documentElement.style.setProperty("--mouse-y", `${y}%`);
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAnalyzeIdea = async (ideaText) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const resultData = await analyzeProject(ideaText);
      setAnalysisResult(resultData);
      
      // Save history log
      setHistory((prev) => {
        const updated = [{
          id: Date.now(),
          projectName: ideaText.slice(0, 32) + (ideaText.length > 32 ? '...' : ''),
          date: new Date().toLocaleDateString(),
          data: resultData
        }, ...prev];
        localStorage.setItem('audit_history', JSON.stringify(updated));
        return updated;
      });
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

  const handleSelectHistory = (item) => {
    setAnalysisResult(item.data);
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('audit_history');
  };

  // Rebuilt Layout: Left Navigation Sidebar + Main Workspace
  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--bg-dark)', position: 'relative' }}>
      <div className="bg-grid-overlay"></div>
      
      {/* Left Sidebar navigation panel */}
      {user && (
        <aside style={{ width: '260px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-dim)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          
          {/* Logo Brand Header */}
          <div onClick={handleReset} style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-dim)' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--primary-glow)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em', margin: 0 }}>De-Risk <span style={{ color: 'var(--primary-color)' }}>AI</span></h2>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button onClick={handleReset} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', background: !analysisResult ? 'var(--bg-card)' : 'transparent', border: 'none', borderLeft: !analysisResult ? '2px solid var(--primary-color)' : '2px solid transparent', color: 'var(--text-bright)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>
              <span>⚙️</span> Workspace
            </button>
          </nav>

          {/* Audit History Area */}
          <div style={{ flex: 1, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-dim)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>Audit History</span>
              {history.length > 0 && (
                <button onClick={handleClearHistory} style={{ background: 'none', border: 'none', color: 'var(--rose-color)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
              {history.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '0.5rem 0' }}>No reports logged.</div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleSelectHistory(item)}
                    style={{ 
                      padding: '0.6rem 0.75rem', 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid var(--border-dim)', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      transition: 'all 0.15s ease',
                      fontSize: '0.78rem',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-dim)'; }}
                  >
                    <div style={{ color: 'var(--text-bright)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.projectName}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginTop: '0.15rem' }}>{item.date}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Profile Area */}
          <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--border-dim)', background: 'rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-glow)', border: '1px solid rgba(34, 197, 94, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-bright)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Product Specialist</div>
              </div>
            </div>
          </div>

        </aside>
      )}

      {/* Right Main Content Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Top bar / command area */}
        {user && (
          <header style={{ height: '64px', borderBottom: '1px solid var(--border-dim)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Workspace / Console</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="status-dot-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald-color)' }}></span>
                AI Engine Online
              </span>
              <button 
                onClick={handleSignOut} 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid var(--border-dim)', 
                  color: 'var(--rose-color)', 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Logout
              </button>
            </div>
          </header>
        )}

        {/* Workspace Body */}
        <main style={{ flex: 1, padding: user ? '2.5rem' : '0', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          
          {!user ? (
            <Auth onAuthSuccess={(userData) => setUser(userData)} />
          ) : (
            <>
              {error && (
                <div className="error-box" style={{ width: '100%' }}>
                  <div className="error-message">
                    <strong>Diagnostic Error:</strong> {error}
                  </div>
                  <button className="btn-dismiss" onClick={() => setError(null)}>
                    Dismiss
                  </button>
                </div>
              )}

              {isAnalyzing && <StepLoader />}

              {!analysisResult && !isAnalyzing && (
                <IdeaForm onSubmit={handleAnalyzeIdea} isAnalyzing={isAnalyzing} />
              )}

              {analysisResult && !isAnalyzing && (
                <AnalysisResult result={analysisResult} onReset={handleReset} />
              )}
            </>
          )}

        </main>

        {/* Workspace Footer */}
        {user && (
          <footer style={{ padding: '1.5rem 0', borderTop: '1px solid var(--border-dim)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', flexShrink: 0 }}>
            <p>© 2026 De-Risk AI. Enterprise Conceptual Diagnostics Console.</p>
          </footer>
        )}
      </div>

    </div>
  );
}
