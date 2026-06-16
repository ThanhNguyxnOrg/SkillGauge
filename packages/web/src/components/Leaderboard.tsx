import React from 'react';
import { Award, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LeaderboardSkill {
  name: string;
  repository: string;
  hash: string;
  author: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  overallScore: number;
  submittedAt: string;
}

interface LeaderboardProps {
  skills: LeaderboardSkill[];
  onSelectSkill: (key: string) => void;
  localKeys: string[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ skills, onSelectSkill, localKeys }) => {
  const findLocalKey = (name: string) => {
    const cleanName = name.replace('🌟 ', '').toLowerCase();
    return localKeys.find(key => {
      const kLow = key.toLowerCase();
      return kLow === cleanName || cleanName.includes(kLow) || kLow.includes(cleanName);
    });
  };

  return (
    <div className="bezel-outer">
      <div className="bezel-inner">
        <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award style={{ color: '#a78bfa' }} /> Global Agent Skills Leaderboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Real-time audited rankings of process prompts. Higher scores reflect better quality, safety compliance, and inference economy.
        </p>

        <div className="table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Skill Name</th>
                <th>Repository</th>
                <th>Tier</th>
                <th>Author</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, index) => {
                const localKey = findLocalKey(skill.name);
                const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
                const tierClass = skill.tier === 'Tier 1' ? 'tier-1' : skill.tier === 'Tier 2' ? 'tier-2' : 'tier-3';

                return (
                  <tr key={skill.hash} onClick={() => localKey && onSelectSkill(localKey)} style={{ cursor: localKey ? 'pointer' : 'default' }}>
                    <td>
                      <span className={`badge-rank ${rankClass}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {skill.name}
                    </td>
                    <td>
                      <code style={{ fontSize: '12px' }}>{skill.repository}</code>
                    </td>
                    <td>
                      <span className={`badge-tier ${tierClass}`}>
                        {skill.tier === 'Tier 1' ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                        {skill.tier}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      @{skill.author}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
