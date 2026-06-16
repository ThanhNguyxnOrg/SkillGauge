import React from 'react';
import { Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';
import { auditSkill } from '@skillgauge/core';

interface SkillFile {
  name: string;
  path: string;
  content: string;
}

interface SkillExplorerProps {
  skills: { [key: string]: SkillFile };
  onSelectSkill: (key: string) => void;
}

export const SkillExplorer: React.FC<SkillExplorerProps> = ({ skills, onSelectSkill }) => {
  const getAuditResult = (content: string) => {
    try {
      return auditSkill(content);
    } catch (err) {
      return { overallScore: 0, tier: 'Tier 3' as const };
    }
  };

  return (
    <div style={{ width: '100%', marginBottom: '64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Terminal style={{ color: '#10b981' }} />
        <h2 className="section-subtitle" style={{ marginBottom: 0 }}>Installed Skills</h2>
      </div>

      <div className="skills-grid">
        {Object.entries(skills).map(([key, skill]) => {
          const audit = getAuditResult(skill.content);
          const tierClass = audit.tier === 'Tier 1' ? 'tier-1' : audit.tier === 'Tier 2' ? 'tier-2' : 'tier-3';

          return (
            <div key={key} className="bezel-outer" style={{ height: '100%' }}>
              <div
                className="bezel-inner skill-card-inner"
                onClick={() => onSelectSkill(key)}
              >
                <div className="skill-card-header">
                  <span className="skill-name-title">{key}</span>
                  <span className="skill-score-label" style={{
                    color: audit.tier === 'Tier 1' ? 'var(--color-tier-1)' : audit.tier === 'Tier 2' ? 'var(--color-tier-2)' : 'var(--color-tier-3)'
                  }}>
                    {audit.overallScore.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {skill.content.match(/description:\s*(.*)/)?.[1]?.replace(/['"]/g, '') || 'Agent skill instruction set'}
                </div>
                <div className="skill-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`badge-tier ${tierClass}`} style={{ padding: '2px 8px', fontSize: '10px' }}>
                      {audit.tier === 'Tier 1' ? <CheckCircle2 size={10} /> : <ShieldAlert size={10} />}
                      {audit.tier}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
