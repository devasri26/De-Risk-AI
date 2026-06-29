import React from 'react';

export default function AnalysisResult({ result, onReset }) {
  if (!result) return null;

  const { 
    risks, 
    failureReasons, 
    challenges, 
    solutions,
    investorReadinessScore = 50,
    marketPotentialScore = 50,
    scalabilityScore = 50,
    revenueModelScore = 50,
    executionFeasibilityScore = 50,
    technicalRisk = 50,
    budgetRisk = 50,
    marketRisk = 50,
    scalabilityRisk = 50,
    operationalRisk = 50,
    roadmap = []
  } = result;
  const [simulation, setSimulation] = React.useState({
    budget: false,
    team: false,
    timeline: false,
    marketing: false,
    infra: false
  });

  React.useEffect(() => {
    setSimulation({
      budget: false,
      team: false,
      timeline: false,
      marketing: false,
      infra: false
    });
  }, [result]);
  
  // Resolve both confidenceScore and the typo field confidsenceScore defensively
  const confidenceScore = result.confidenceScore !== undefined 
    ? result.confidenceScore 
    : (result.confidsenceScore !== undefined ? result.confidsenceScore : 50);

  const successBase = confidenceScore;
  const investorBase = investorReadinessScore;
  const riskBase = 100 - confidenceScore;

  let successSim = successBase;
  let investorSim = investorBase;
  let riskSim = riskBase;

  if (simulation.budget) { successSim += 6; investorSim += 5; riskSim -= 6; }
  if (simulation.team) { successSim += 4; investorSim += 3; riskSim -= 4; }
  if (simulation.timeline) { successSim -= 8; investorSim -= 5; riskSim += 8; }
  if (simulation.marketing) { successSim += 2; investorSim += 8; riskSim -= 2; }
  if (simulation.infra) { successSim += 8; investorSim += 4; riskSim -= 8; }

  successSim = Math.min(100, Math.max(0, successSim));
  investorSim = Math.min(100, Math.max(0, investorSim));
  riskSim = Math.min(100, Math.max(0, riskSim));

  const getRiskLevelName = (score) => {
    if (score >= 50) return "High";
    if (score >= 25) return "Medium";
    return "Low";
  };

  const getInvestorVerdictName = (score) => {
    if (score >= 80) return "Investor Ready";
    if (score >= 60) return "Needs Improvement";
    return "High Risk Investment";
  };

  const baseRiskLevel = getRiskLevelName(riskBase);
  const simRiskLevel = getRiskLevelName(riskSim);

  const baseInvVerdict = getInvestorVerdictName(investorBase);
  const simInvVerdict = getInvestorVerdictName(investorSim);

  const simChartRef = React.useRef(null);
  const simChartInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (simChartRef.current) {
      if (simChartInstanceRef.current) {
        simChartInstanceRef.current.destroy();
      }

      const ChartGlobal = window.Chart;
      if (ChartGlobal) {
        simChartInstanceRef.current = new ChartGlobal(simChartRef.current, {
          type: 'bar',
          data: {
            labels: ['Success Prob.', 'Risk Score', 'Investor Ready'],
            datasets: [
              {
                label: 'Before',
                data: [successBase, riskBase, investorBase],
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
              },
              {
                label: 'After',
                data: [successSim, riskSim, investorSim],
                backgroundColor: 'rgba(34, 197, 94, 0.65)',
                borderColor: '#22C55E',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
              legend: {
                labels: {
                  color: 'var(--text-muted)',
                  font: {
                    family: "'Outfit', sans-serif"
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.4)',
                  font: {
                    size: 10
                  }
                },
                min: 0,
                max: 100
              },
              y: {
                grid: {
                  display: false
                },
                ticks: {
                  color: 'var(--text-muted)',
                  font: {
                    family: "'Outfit', sans-serif",
                    size: 10,
                    weight: '600'
                  }
                }
              }
            }
          }
        });
      }
    }
    return () => {
      if (simChartInstanceRef.current) {
        simChartInstanceRef.current.destroy();
      }
    };
  }, [successSim, riskSim, investorSim, successBase, riskBase, investorBase]);

  // SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (circumference * confidenceScore) / 100;

  // Choose colors based on confidence level
  const chartRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      const ChartGlobal = window.Chart;
      if (ChartGlobal) {
        chartInstanceRef.current = new ChartGlobal(chartRef.current, {
          type: 'radar',
          data: {
            labels: ['Technical', 'Budget', 'Market', 'Scalability', 'Operational'],
            datasets: [{
              label: 'Risk Level %',
              data: [technicalRisk, budgetRisk, marketRisk, scalabilityRisk, operationalRisk],
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              borderColor: '#F59E0B',
              pointBackgroundColor: '#F59E0B',
              pointBorderColor: '#FAFAFA',
              pointHoverBackgroundColor: '#FAFAFA',
              pointHoverBorderColor: '#F59E0B',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              r: {
                angleLines: {
                  color: 'rgba(255, 255, 255, 0.08)'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.08)'
                },
                pointLabels: {
                  color: '#9ca3af',
                  font: {
                    family: "'Outfit', sans-serif",
                    size: 10,
                    weight: '600'
                  }
                },
                ticks: {
                  backdropColor: 'transparent',
                  color: 'rgba(255, 255, 255, 0.3)',
                  showLabelBackdrop: false,
                  font: {
                    size: 8
                  },
                  stepSize: 20
                },
                min: 0,
                max: 100
              }
            }
          }
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [result, technicalRisk, budgetRisk, marketRisk, scalabilityRisk, operationalRisk]);

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

      {/* Investor Readiness Score Card */}
      <div className="glass-card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ borderBottom: '1px dashed var(--border-dim)', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Assessment</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>Investor Readiness</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }} className={
              investorReadinessScore >= 80 ? 'text-emerald' : (investorReadinessScore >= 60 ? 'text-amber' : 'text-rose')
            }>
              {investorReadinessScore}/100
            </div>
            <span className={`badge-pill ${
              investorReadinessScore >= 80 ? 'badge-emerald' : (investorReadinessScore >= 60 ? 'badge-amber' : 'badge-rose')
            }`} style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
              {investorReadinessScore >= 80 ? 'Investor Ready' : (investorReadinessScore >= 60 ? 'Needs Improvement' : 'High Risk Investment')}
            </span>
          </div>
        </div>

        <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {[
            { label: 'Market Potential', score: marketPotentialScore },
            { label: 'Scalability', score: scalabilityScore },
            { label: 'Revenue Model', score: revenueModelScore },
            { label: 'Execution Feasibility', score: executionFeasibilityScore }
          ].map((item, idx) => {
            let color = 'var(--rose-color)';
            if (item.score >= 80) color = 'var(--emerald-color)';
            else if (item.score >= 60) color = 'var(--amber-color)';

            return (
              <div key={idx} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', margin: 0 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800 }} className={item.score >= 80 ? 'text-emerald' : (item.score >= 60 ? 'text-amber' : 'text-rose')}>
                    {item.score}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.score}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 1s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Risk Heatmap Section */}
      <div>
        <h3 className="section-title">Project Risk Heatmap</h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          
          {/* Heatmap cards */}
          <div className="glass-card" style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1.5rem', minWidth: '320px', margin: 0 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)' }}>Risk Vectors & Severity</h4>
            {[
              { name: "Technical Risk", score: technicalRisk },
              { name: "Budget Risk", score: budgetRisk },
              { name: "Market Risk", score: marketRisk },
              { name: "Scalability Risk", score: scalabilityRisk },
              { name: "Operational Risk", score: operationalRisk }
            ].map((item, idx) => {
              let level = "Low";
              let bg = "rgba(16, 185, 129, 0.05)";
              let border = "rgba(16, 185, 129, 0.2)";
              let textClass = "text-emerald";
              let barColor = "var(--emerald-color)";
              
              if (item.score >= 70) {
                level = "High";
                bg = "rgba(244, 63, 94, 0.07)";
                border = "rgba(244, 63, 94, 0.25)";
                textClass = "text-rose";
                barColor = "var(--rose-color)";
              } else if (item.score >= 40) {
                level = "Medium";
                bg = "rgba(217, 119, 6, 0.07)";
                border = "rgba(217, 119, 6, 0.25)";
                textClass = "text-amber";
                barColor = "var(--amber-color)";
              }

              return (
                <div key={idx} className="glass-card" style={{ background: bg, borderColor: border, padding: '0.75rem 1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-bright)' }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge-pill ${level === 'High' ? 'badge-rose' : (level === 'Medium' ? 'badge-amber' : 'badge-emerald')}`} style={{ padding: '2px 8px', fontSize: '0.65rem', borderRadius: '4px' }}>{level}</span>
                      <span className={textClass} style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.score}%</span>
                    </div>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '3px', overflow: 'hidden', width: '100%' }}>
                    <div style={{ width: `${item.score}%`, height: '100%', background: barColor, borderRadius: '3px', transition: 'width 1.2s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Radar Chart */}
          <div className="glass-card" style={{ flex: '1', display: 'flex', flexDirection: 'column', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', minWidth: '300px', minHeight: '320px', margin: 0 }}>
            <h4 style={{ margin: '0 0 1.5rem 0', alignSelf: 'flex-start', fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)' }}>Risk Profiler Visualization</h4>
            <div style={{ width: '100%', height: '260px', position: 'relative' }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

        </div>
      </div>

      {/* AI Implementation Roadmap Section */}
      <div>
        <h3 className="section-title">AI Implementation Roadmap</h3>
        <div className="glass-card" style={{ marginTop: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: 0 }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)' }}>Execution Phases & Timeline</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', borderLeft: '2px dashed rgba(255, 255, 255, 0.1)', marginLeft: '1.5rem', paddingLeft: '2.25rem' }}>
            {roadmap.length === 0 ? (
              <p className="card-text">No implementation roadmap generated for this concept.</p>
            ) : (
              roadmap.map((phaseData, index) => {
                const nodeColor = `hsl(${(index * 55) % 360}, 75%, 55%)`;
                const nodeGlow = `hsla(${(index * 55) % 360}, 75%, 55%, 0.15)`;
                
                return (
                  <div key={index} className="animate-slide-up" style={{ position: 'relative' }}>
                    {/* Circle Node circle */}
                    <div style={{ position: 'absolute', left: '-3.05rem', top: 0, width: '1.6rem', height: '1.6rem', background: '#0f172a', border: `2.5px solid ${nodeColor}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', boxShadow: `0 0 10px ${nodeGlow}`, zIndex: 2 }}>
                      {index + 1}
                    </div>

                    {/* Content Card */}
                    <div className="glass-card" style={{ padding: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', width: '100%' }}>
                        <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-bright)' }}>{phaseData.phase}</h5>
                        <span className="badge-pill" style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', padding: '2px 10px', fontSize: '0.7rem', borderRadius: '4px' }}>Duration: {phaseData.duration}</span>
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {Array.isArray(phaseData.tasks) && phaseData.tasks.map((task, tIdx) => (
                          <li key={tIdx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                            <span style={{ color: nodeColor, fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1 }}>•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Scenario What-If Simulator Section */}
      <div>
        <h3 className="section-title">Scenario What-If Simulator</h3>
        <div className="glass-card" style={{ marginTop: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', margin: 0 }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)' }}>Model Alternative Decision Paths</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { key: "budget", label: "Increase Budget by 20%", icon: "💰" },
              { key: "team", label: "Increase Team Size", icon: "👥" },
              { key: "timeline", label: "Reduce Timeline", icon: "⏱️" },
              { key: "marketing", label: "Increase Marketing", icon: "📈" },
              { key: "infra", label: "Improve Infrastructure", icon: "☁️" }
            ].map((item) => (
              <div 
                key={item.key}
                className="glass-card"
                style={{
                  padding: '1rem',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.25s ease',
                  background: simulation[item.key] ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.01)',
                  borderColor: simulation[item.key] ? 'var(--primary-color)' : 'var(--border-dim)'
                }}
                onClick={() => setSimulation(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              >
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)' }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {/* Left comparative display */}
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', minWidth: '280px', margin: 0, background: 'var(--card-bg)' }}>
              <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-bright)' }}>Alternative Projection</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Success Probability */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <span>Success Probability</span>
                    <span style={{ color: successSim >= successBase ? 'var(--emerald-color)' : 'var(--rose-color)', fontWeight: 'bold' }}>
                      {successSim >= successBase ? '+' : ''}{successSim - successBase}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>{successBase}%</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>→</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: successSim >= 75 ? 'var(--emerald-color)' : (successSim >= 50 ? 'var(--amber-color)' : 'var(--rose-color)') }}>{successSim}%</span>
                  </div>
                </div>

                {/* Risk Score */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <span>Risk Score & Level</span>
                    <span style={{ color: riskSim <= riskBase ? 'var(--emerald-color)' : 'var(--rose-color)', fontWeight: 'bold' }}>
                      {riskSim >= riskBase ? '+' : ''}{riskSim - riskBase}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>{riskBase}% ({baseRiskLevel})</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>→</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: riskSim >= 50 ? 'var(--rose-color)' : (riskSim >= 25 ? 'var(--amber-color)' : 'var(--emerald-color)') }}>{riskSim}% ({simRiskLevel})</span>
                  </div>
                </div>

                {/* Investor Readiness */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <span>Investor Readiness</span>
                    <span style={{ color: investorSim >= investorBase ? 'var(--emerald-color)' : 'var(--rose-color)', fontWeight: 'bold' }}>
                      {investorSim >= investorBase ? '+' : ''}{investorSim - investorBase}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>{investorBase}/100 ({baseInvVerdict})</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>→</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: investorSim >= 80 ? 'var(--emerald-color)' : (investorSim >= 60 ? 'var(--amber-color)' : 'var(--rose-color)') }}>{investorSim}/100 ({simInvVerdict})</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right chart */}
            <div className="glass-card" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', minWidth: '300px', minHeight: '280px', margin: 0 }}>
              <h5 style={{ margin: '0 0 1rem 0', alignSelf: 'flex-start', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-bright)' }}>Projection Chart</h5>
              <div style={{ width: '100%', height: '200px', position: 'relative' }}>
                <canvas ref={simChartRef}></canvas>
              </div>
            </div>
          </div>

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
