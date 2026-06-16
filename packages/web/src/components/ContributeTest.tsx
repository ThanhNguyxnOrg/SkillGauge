import React, { useState } from 'react';
import { Sparkles, Github, AlertCircle, Code } from 'lucide-react';

export const ContributeTest: React.FC = () => {
  const [type, setType] = useState<'static' | 'dynamic'>('static');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !description.trim()) {
      setError('Please fill in all fields before submitting.');
      return;
    }
    setError('');

    const issueTitle = `[Test Contribution] ${type === 'static' ? 'Static' : 'Dynamic'}: ${title.trim()}`;
    const issueBody = `### Contributor details
**Name/GitHub Handle:** @${name.trim().replace(/^@/, '')}

### Test category
**Category:** ${type === 'static' ? 'Static Quality Scorer' : 'Dynamic Runtime Probe'}

### Proposed idea / assertion logic
${description.trim()}

---
*Submitted via SkillGauge Portal*`;

    const githubUrl = `https://github.com/ThanhNguyxnOrg/SkillGauge/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;
    window.open(githubUrl, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div className="bezel-outer" style={{ width: '100%' }}>
        <div className="bezel-inner">
          <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles style={{ color: '#a78bfa' }} /> Suggest Test Criteria
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Help improve the SkillGauge evaluation suite by contributing ideas for static scorers or dynamic probing scenarios.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                Test Type
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setType('static')}
                  style={{
                    flex: 1,
                    background: type === 'static' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${type === 'static' ? '#8b5cf6' : 'var(--border-muted)'}`,
                    borderRadius: '12px',
                    padding: '12px',
                    color: type === 'static' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: type === 'static' ? 'bold' : 'normal',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Code size={16} />
                  Static Scorer
                </button>
                <button
                  type="button"
                  onClick={() => setType('dynamic')}
                  style={{
                    flex: 1,
                    background: type === 'dynamic' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${type === 'dynamic' ? '#10b981' : 'var(--border-muted)'}`,
                    borderRadius: '12px',
                    padding: '12px',
                    color: type === 'dynamic' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: type === 'dynamic' ? 'bold' : 'normal',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={16} />
                  Dynamic Test
                </button>
              </div>
            </div>

            {/* Contributor Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                Your Name / GitHub Username
              </label>
              <input
                type="text"
                placeholder="e.g. ThanhNguyxnOrg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                Test Name / Code Name
              </label>
              <input
                type="text"
                placeholder={type === 'static' ? "e.g. C16: Advanced System Instruction Shielding" : "e.g. Jailbreak evasion check"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                Idea / Logic Description
              </label>
              <textarea
                rows={4}
                placeholder={
                  type === 'static'
                    ? "Explain the heuristic logic or regex check (e.g., verifying delimiter pairs)."
                    : "Describe the LLM test case (input, assertions, expected keywords)."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '12px' }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-pill btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
            >
              <Github size={14} /> Open GitHub Issue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
