import React, { useState } from 'react';

const PRESETS = [
  "Example: Food delivery app in village",
  "RAG search assistant for PDF documents",
  "High-frequency transaction fraud warning system"
];

export default function IdeaForm({ onSubmit, isAnalyzing }) {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!idea.trim()) return;
    onSubmit(idea);
  };

  const handlePresetSelect = (presetText) => {
    setIdea(presetText);
  };

  return (
    <div className="glass-card animate-slide-up">
      <div className="form-header">
        <h2 className="form-title">Enter Project Concept</h2>
        <p className="form-description">
          Describe the AI application idea you want to build. Highlight target users, datatypes, modeling methods, and key success metrics for an accurate feasibility report.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          className="textarea-field"
          placeholder="Example: Food delivery app in village"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={isAnalyzing}
          required
        />

        <div className="form-footer">
          <div className="presets-row">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip"
                onClick={() => handlePresetSelect(preset)}
                disabled={isAnalyzing}
              >
                {preset.startsWith("Example:") ? "Sample: Food Delivery" : preset}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isAnalyzing || !idea.trim()}
          >
            {isAnalyzing ? (
              <>
                <div className="spinner-ring" style={{ width: '16px', height: '16px', borderWidth: '2px', margin: 0, boxShadow: 'none' }} />
                Analyzing...
              </>
            ) : (
              "Analyze Project"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
