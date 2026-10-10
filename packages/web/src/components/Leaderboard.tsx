import React, { useMemo, useState } from 'react';
import { Award, ShieldAlert, CheckCircle2, Medal, Search } from 'lucide-react';

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

const PAGE_SIZE = 50;

function tierIcon(tier: string) {
  if (tier === 'Tier 1') return <CheckCircle2 size={12} aria-hidden="true" />;
  if (tier === 'Tier 2') return <Medal size={12} aria-hidden="true" />;
  return <ShieldAlert size={12} aria-hidden="true" />;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ skills, onSelectSkill, localKeys }) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const findLocalKey = (name: string) => {
    const cleanName = name.replace('🌟 ', '').toLowerCase();
    return localKeys.find(key => {
      const kLow = key.toLowerCase();
      return kLow === cleanName || cleanName.includes(kLow) || kLow.includes(cleanName);
    });
  };

  // Sort skills descending by score to guarantee correct ranking order
  const sortedSkills = useMemo(
    () => [...skills].sort((a, b) => b.overallScore - a.overallScore),
    [skills]
  );
  const rankOf = useMemo(() => {
    const m = new Map<string, number>();
    sortedSkills.forEach((s, i) => m.set(s.hash, i + 1));
    return m;
  }, [sortedSkills]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? sortedSkills.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.repository.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q))
    : sortedSkills;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bezel-outer">
      <div className="bezel-inner">
        <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award style={{ color: '#a78bfa' }} /> Global Agent Skills Leaderboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Real-time audited rankings of process prompts. Higher scores reflect better quality, safety compliance, and inference economy.
        </p>

        <div className="leaderboard-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <label htmlFor="leaderboard-search" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            Search skills
          </label>
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
            <Search size={14} aria-hidden="true" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="leaderboard-search"
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Search name, repository, author…"
              style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid var(--border-muted)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px' }}
            />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }} role="status">
            {filtered.length} of {skills.length} skills · page {safePage + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            aria-label="Previous page"
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-muted)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: safePage === 0 ? 'default' : 'pointer', opacity: safePage === 0 ? 0.4 : 1 }}
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            aria-label="Next page"
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-muted)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: safePage >= pageCount - 1 ? 'default' : 'pointer', opacity: safePage >= pageCount - 1 ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>

        <div className="table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Skill Name</th>
                <th scope="col">Repository</th>
                <th scope="col">Tier</th>
                <th scope="col">Score</th>
                <th scope="col">Author</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((skill) => {
                const localKey = findLocalKey(skill.name);
                const rank = rankOf.get(skill.hash) ?? 0;
                const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
                const tierClass = skill.tier === 'Tier 1' ? 'tier-1' : skill.tier === 'Tier 2' ? 'tier-2' : 'tier-3';
                const clickable = Boolean(localKey);

                return (
                  <tr
                    key={skill.hash}
                    onClick={() => localKey && onSelectSkill(localKey)}
                    onKeyDown={(e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelectSkill(localKey as string); } }}
                    tabIndex={clickable ? 0 : undefined}
                    role={clickable ? 'button' : undefined}
                    aria-label={clickable ? `View details for ${skill.name}` : undefined}
                    style={{ cursor: clickable ? 'pointer' : 'default' }}
                  >
                    <td>
                      <span className={`badge-rank ${rankClass}`}>
                        {rank}
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
                        {tierIcon(skill.tier)}
                        {skill.tier}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', fontFamily: 'var(--mono-font)' }}>
                      {skill.overallScore.toFixed(3)}
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
