import React from 'react';

export default function AnalysisResult({ result, onReset }) {
  if (!result) return null;

  const { risks, failureReasons, challenges, solutions } = result;
  
  // Resolve both confidenceScore and the typo field confidsenceScore defensively
  const confidenceScore = result.confidenceScore !== undefined 
    ? result.confidenceScore 
    : (result.confidsenceScore !== undefined ? result.confidsenceScore : 50);

  // SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (circumference * confidenceScore) / 100;

  // Choose colors based on confidence level
  const getTheme = (score) => {
    if (score >= 75) {
      return {
        textClass: 'text-emerald',
        stroke: 'var(--emerald-color)',
        badgeClass: 'badge-emerald',
        label: 'Highly Feasible'
      };
    } else if (score >= 50) {
      return {
        textClass: 'text-amber',
        stroke: 'var(--amber-color)',
        badgeClass: 'badge-amber',
        label: 'Moderate Risk'
      };
    } else {
      return {
        textClass: 'text-rose',
        stroke: 'var(--rose-color)',
        badgeClass: 'badge-rose',
        label: 'High Risk'
      };
    }
  };

  const theme = getTheme(confidenceScore);

  const getSeverityBadgeClass = (severity) => {
    const s = (severity || 'medium').toLowerCase();
    if (s === 'high') return 'badge-rose';
    if (s === 'low') return 'badge-emerald';
    return 'badge-amber';
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Result Top Action Header */}
      <div className="result-header">
        <div className="result-title-section">
          <span>Diagnostic Assessment</span>
          <h2>Audit Diagnostic Report</h2>
        </div>
        <button className="btn-outline" onClick={onReset}>
          ← Analyze New Idea
        </button>
      </div>

      {/* Grid: Gauge Circle + Failure Causes list */}
      <div className="diagnostics-row">
        
        {/* SVG circular gauge */}
        <div className="glass-card gauge-panel">
          <h3 className="card-subtitle" style={{ marginBottom: '1.25rem' }}>Feasibility Confidence</h3>
          
          <div className="svg-container">
            <svg className="svg-circle-bg" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%', viewBox: '0 0 120 120' }}>
              {/* Background trace */}
              <circle cx="60" cy="60" r={radius} />
              {/* Active trace */}
              <circle
                className="svg-circle-fill"
                cx="60"
                cy="60"
                r={radius}
                stroke={theme.stroke}
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div className="svg-score-label">
              <span className={`score-number ${theme.textClass}`}>{confidenceScore}%</span>
              <span className="score-text">Rating</span>
            </div>
          </div>

          <div className={`badge-pill ${theme.badgeClass}`}>
            {theme.label}
          </div>
        </div>

        {/* Failure Causes Card */}
        <div className="glass-card info-list-panel">
          <h3 className="info-list-title">
            ⚠️ Failure Causes
          </h3>
          <p className="card-text" style={{ marginBottom: '0.5rem' }}>
            Historical audits map these factors as primary risk drivers for similar architectures:
          </p>
          {failureReasons && failureReasons.length > 0 ? (
            failureReasons.map((reason, idx) => (
              <div key={idx} className="info-list-item">
                <span className="info-list-bullet">{idx + 1}</span>
                <span>{reason}</span>
              </div>
            ))
          ) : (
            <p className="card-text">No distinct failure triggers isolated.</p>
          )}
        </div>

      </div>

      {/* Risks breakdown cards */}
      <div>
        <h3 className="section-title">Isolated System Risks</h3>
        <div className="cards-grid">
          {risks && risks.map((riskObj, idx) => (
            <div key={idx} className="glass-card risk-card">
              <div className="card-header-flex">
                <h4 className="card-subtitle">{riskObj.risk}</h4>
                <span className={`badge-pill ${getSeverityBadgeClass(riskObj.severity)}`} style={{ padding: '2px 10px', fontSize: '0.7rem' }}>
                  {riskObj.severity}
                </span>
              </div>
              <p className="card-text">{riskObj.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Match Layout: Challenges and Solutions side-by-side */}
      <div>
        <h3 className="section-title">Challenges & Solutions</h3>
        <div className="match-layout">
          
          <div className="match-thead">
            <div className="match-th-cell"> ब्लॉकर्स (Blockers) / Challenge</div>
            <div className="match-th-cell">शमन (Mitigation) / Actionable Solution</div>
          </div>

          <div>
            {solutions && solutions.map((solPair, idx) => (
              <div key={idx} className="match-trow">
                
                {/* Challenge column */}
                <div className="match-td-cell">
                  {solPair.challenge}
                </div>

                {/* Solution column */}
                <div className="match-td-cell">
                  {solPair.solution}
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
