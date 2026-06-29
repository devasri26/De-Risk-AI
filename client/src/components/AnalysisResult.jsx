import React, { useState, useEffect, useRef } from 'react';

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
    roadmap = [],
    swot = { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    estimates = { 
      estimatedBudget: "₹4–6 Lakhs", 
      estimatedDuration: "4–6 Months", 
      recommendedTeamSize: "5 Developers", 
      complexityLevel: "Medium", 
      estimatedMaintenanceCost: "₹40K / Month" 
    }
  } = result;

  const [simulation, setSimulation] = useState({
    budget: false,
    team: false,
    timeline: false,
    marketing: false,
    infra: false
  });

  useEffect(() => {
    setSimulation({
      budget: false,
      team: false,
      timeline: false,
      marketing: false,
      infra: false
    });
  }, [result]);
  
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

  const simChartRef = useRef(null);
  const simChartInstanceRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
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
                  font: { family: "'Outfit', sans-serif" }
                }
              }
            },
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10 } },
                min: 0,
                max: 100
              },
              y: {
                grid: { display: false },
                ticks: { color: 'var(--text-muted)', font: { family: "'Outfit', sans-serif", size: 10, weight: '600' } }
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

  useEffect(() => {
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
            plugins: { legend: { display: false } },
            scales: {
              r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                grid: { color: 'rgba(255, 255, 255, 0.08)' },
                pointLabels: { color: '#9ca3af', font: { family: "'Outfit', sans-serif", size: 10, weight: '600' } },
                ticks: { backdropColor: 'transparent', color: 'rgba(255, 255, 255, 0.3)', showLabelBackdrop: false, font: { size: 8 }, stepSize: 20 },
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
        stroke: '#22C55E',
        badgeClass: 'badge-emerald',
        label: 'Highly Feasible'
      };
    } else if (score >= 50) {
      return {
        textClass: 'text-amber',
        stroke: '#F59E0B',
        badgeClass: 'badge-amber',
        label: 'Conditionally Feasible'
      };
    } else {
      return {
        textClass: 'text-rose',
        stroke: '#EF4444',
        badgeClass: 'badge-rose',
        label: 'High Conceptual Risk'
      };
    }
  };

  const theme = getTheme(confidenceScore);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%' }}>
      
      {/* Consulting Report Header */}
      <div style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--primary-color)', fontWeight: 700 }}>
            Enterprise Concept Diagnostic Audit
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-bright)', marginTop: '0.25rem' }}>Feasibility Report</h2>
        </div>
        <button className="btn-outline" onClick={onReset} style={{ padding: '0.5rem 1rem' }}>
          ← Back to Workspace
        </button>
      </div>

      {/* Estimator High-Density Statistics Metadata Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: "Estimated Budget", value: estimates.estimatedBudget, desc: "Development cost", color: "var(--text-bright)" },
          { label: "Timeline Duration", value: estimates.estimatedDuration, desc: "Expected runway", color: "var(--text-bright)" },
          { label: "Team Size", value: estimates.recommendedTeamSize, desc: "Staffing footprint", color: "var(--text-bright)" },
          { label: "Complexity Level", value: estimates.complexityLevel, desc: "System execution", color: estimates.complexityLevel === "High" ? "var(--rose-color)" : estimates.complexityLevel === "Medium" ? "var(--amber-color)" : "var(--emerald-color)" },
          { label: "Maintenance Cost", value: estimates.estimatedMaintenanceCost, desc: "Monthly operational", color: "var(--text-bright)" }
        ].map((item, idx) => (
          <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.label}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: item.color }}>{item.value}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Structured Document Workspace Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Document Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Executive Summary & Confidence Score */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0 }}>
              <svg style={{ transform: 'rotate(-90deg)', width: '100px', height: '100px' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#111111" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={theme.stroke} strokeWidth="6" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 - (2 * Math.PI * 42 * confidenceScore) / 100} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: theme.stroke }}>
                {confidenceScore}%
              </div>
            </div>
            <div>
              <span className={`badge-pill ${theme.badgeClass}`} style={{ display: 'inline-block', fontSize: '0.7rem', textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 800 }}>
                {theme.label}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                The diagnostic engine computes a {confidenceScore}% confidence score based on resource allocations, concurrency models, and architecture design rules.
              </p>
            </div>
          </div>

          {/* Failure Reasons list */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-dim)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span> Potential Failure Drivers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {failureReasons && failureReasons.map((reason, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--rose-color)', fontWeight: 800 }}>0{idx + 1}</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Document Column: Radar Chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)', padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-dim)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Risk Profiler Vectors
          </h3>
          <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

      </div>

      {/* SWOT Analysis 2x2 Grid Section */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-bright)' }}>Strategic SWOT Matrix</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: "Strengths", items: swot.strengths, icon: "🛡️", color: "var(--emerald-color)" },
            { label: "Weaknesses", items: swot.weaknesses, icon: "⚠️", color: "var(--rose-color)" },
            { label: "Opportunities", items: swot.opportunities, icon: "💡", color: "var(--primary-color)" },
            { label: "Threats", items: swot.threats, icon: "⚡", color: "var(--amber-color)" }
          ].map((cat, idx) => (
            <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: cat.color }}>{cat.label}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cat.items && cat.items.map((bullet, bIdx) => (
                  <li key={bIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    <span style={{ color: cat.color }}>•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario What-If Simulator comparative displays */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-dim)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          What-If Scenario Simulator
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { key: "budget", label: "+20% Budget", icon: "💰" },
            { key: "team", label: "+Staffing", icon: "👥" },
            { key: "timeline", label: "-Timeline", icon: "⏱️" },
            { key: "marketing", label: "+Marketing", icon: "📈" },
            { key: "infra", label: "+Infra scale", icon: "☁️" }
          ].map((item) => (
            <button 
              key={item.key}
              onClick={() => setSimulation(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              style={{
                background: simulation[item.key] ? 'var(--primary-glow)' : 'transparent',
                border: `1px solid ${simulation[item.key] ? 'var(--primary-color)' : 'var(--border-dim)'}`,
                color: simulation[item.key] ? 'var(--primary-color)' : 'var(--text-muted)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Success Probability:</span>
              <span style={{ color: successSim >= successBase ? 'var(--emerald-color)' : 'var(--rose-color)', fontWeight: 'bold' }}>
                {successBase}% → {successSim}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Risk Score & Level:</span>
              <span style={{ color: riskSim <= riskBase ? 'var(--emerald-color)' : 'var(--rose-color)', fontWeight: 'bold' }}>
                {riskBase}% ({baseRiskLevel}) → {riskSim}% ({simRiskLevel})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Investor Readiness:</span>
              <span style={{ color: investorSim >= investorBase ? 'var(--emerald-color)' : 'var(--rose-color)', fontWeight: 'bold' }}>
                {investorBase}/100 → {investorSim}/100
              </span>
            </div>
          </div>
          
          <div style={{ height: '180px', position: 'relative' }}>
            <canvas ref={simChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Risks details */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-bright)' }}>Isolated System Risk Log</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {risks && risks.map((riskObj, idx) => {
            const severityColor = riskObj.severity === "HIGH" ? "var(--rose-color)" : riskObj.severity === "MEDIUM" ? "var(--amber-color)" : "var(--emerald-color)";
            return (
              <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-bright)' }}>{riskObj.risk}</h4>
                  <span style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${severityColor}`, color: severityColor, padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>{riskObj.severity}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{riskObj.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Table Layout: Challenges and Solutions */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-bright)' }}>Actionable Mitigation Matrix</h3>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-dim)' }}>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--text-bright)' }}>Isolated Challenge</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--text-bright)' }}>Actionable Mitigation Solution</th>
              </tr>
            </thead>
            <tbody>
              {solutions && solutions.map((solPair, idx) => (
                <tr key={idx} style={{ borderBottom: idx < solutions.length - 1 ? '1px solid var(--border-dim)' : 'none' }}>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', verticalAlign: 'top', width: '50%' }}>{solPair.challenge}</td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-bright)', verticalAlign: 'top', width: '50%' }}>{solPair.solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
