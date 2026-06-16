import React, { useState } from 'react';
import { Search, Send, AlertTriangle, Loader2, FolderOpen, FileCheck, Info } from 'lucide-react';
import { auditSkill } from '@skillgauge/core';

interface DetectedSkill {
  path: string;
  name: string;
  content: string;
  score: number;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  selected: boolean;
}

export const SubmitSkill: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [detectedSkills, setDetectedSkills] = useState<DetectedSkill[]>([]);
  const [scanError, setScanError] = useState('');

  const [submitStep, setSubmitStep] = useState<'idle' | 'triggering' | 'bot_running' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [prLink, setPrLink] = useState('');

  const parseGitUrl = (url: string): { owner: string; repo: string } => {
    const normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.includes('@') && normalized.includes('/')) {
      const parts = normalized.split('/');
      if (parts.length === 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }
    const match = normalized.match(/(?:github\.com[\/:])([^\/]+)\/([^\/\.]+)/);
    if (!match) {
      throw new Error(`Unsupported Git repository URL or identifier "${url}". Use "owner/repo" or a GitHub HTTPS URL.`);
    }
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  };

  const handleScanRepository = async () => {
    if (!repoUrl.trim()) {
      setScanError('Please enter a repository URL or owner/repo shorthand.');
      return;
    }

    setIsScanning(true);
    setScanError('');
    setScanLogs([]);
    setDetectedSkills([]);

    try {
      const { owner, repo } = parseGitUrl(repoUrl);
      setScanLogs(prev => [...prev, `Parsing target repository: ${owner}/${repo}`]);

      // 1. Get repository default branch
      setScanLogs(prev => [...prev, `Fetching repository information from GitHub API...`]);
      const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'SkillGauge-App'
        }
      });
      
      if (!repoInfoRes.ok) {
        throw new Error(`Repository not found or not accessible (rate limits may apply if unauthenticated): ${repoInfoRes.statusText}`);
      }
      const repoInfo = await repoInfoRes.json();
      const defaultBranch = repoInfo.default_branch || 'main';
      setScanLogs(prev => [...prev, `Found default branch: "${defaultBranch}"`]);

      // 2. Fetch recursive git tree
      setScanLogs(prev => [...prev, `Scanning repository tree recursively...`]);
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'SkillGauge-App'
        }
      });
      if (!treeRes.ok) {
        throw new Error(`Failed to fetch repository tree: ${treeRes.statusText}`);
      }
      const treeData = await treeRes.json();
      
      // 3. Filter markdown files
      const mdFiles = treeData.tree.filter((node: any) => node.type === 'blob' && node.path.endsWith('.md'));
      setScanLogs(prev => [...prev, `Found ${mdFiles.length} markdown (.md) files. Checking contents for skill frontmatter...`]);

      // 4. Fetch and audit files
      const skillsFound: DetectedSkill[] = [];
      let checkedCount = 0;

      for (const node of mdFiles) {
        checkedCount++;
        if (checkedCount % 5 === 0 || checkedCount === mdFiles.length) {
          setScanLogs(prev => [...prev, `Checked ${checkedCount}/${mdFiles.length} files...`]);
        }

        try {
          const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${node.path}?ref=${defaultBranch}`, {
            headers: {
              Accept: 'application/vnd.github.v3.raw',
              'User-Agent': 'SkillGauge-App'
            }
          });
          
          if (!fileRes.ok) continue;
          const text = await fileRes.text();

          // Check for YAML frontmatter name and description
          if (text.trim().startsWith('---') && text.includes('name:') && text.includes('description:')) {
            const report = auditSkill(text);
            skillsFound.push({
              path: node.path,
              name: report.name || node.path.split('/').pop()?.replace('.md', '') || node.path,
              content: text,
              score: report.overallScore,
              tier: report.tier,
              selected: true
            });
            setScanLogs(prev => [...prev, `✨ Auto-detected skill: "${report.name || node.path}" (Score: ${report.overallScore.toFixed(2)})`]);
          }
        } catch (e: any) {
          console.error(`Error reading ${node.path}:`, e);
        }
      }

      setDetectedSkills(skillsFound);
      if (skillsFound.length === 0) {
        setScanLogs(prev => [...prev, `❌ No valid skill files detected. A skill file must have a frontmatter with 'name:' and 'description:' fields.`]);
      } else {
        setScanLogs(prev => [...prev, `✅ Scan complete! Auto-detected ${skillsFound.length} skill files.`]);
      }
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan repository');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectSkillToggle = (index: number) => {
    setDetectedSkills(prev => prev.map((s, idx) => idx === index ? { ...s, selected: !s.selected } : s));
  };

  const handleSelectAll = (val: boolean) => {
    setDetectedSkills(prev => prev.map(s => ({ ...s, selected: val })));
  };

  const handleSubmitToGitHub = async () => {
    setSubmitStep('triggering');
    setSubmitError('');
    setPrLink('');

    try {
      const { owner, repo } = parseGitUrl(repoUrl);
      const targetOwner = 'ThanhNguyxnOrg';
      const targetRepo = 'SkillGauge';
      const token = import.meta.env.VITE_SUBMIT_TOKEN || '';

      if (!token) {
        throw new Error('Web submission token is not configured. Please contact the administrator or build with VITE_SUBMIT_TOKEN.');
      }

      // 1. Trigger the workflow dispatch
      const dispatchUrl = `https://api.github.com/repos/${targetOwner}/${targetRepo}/actions/workflows/submit-repo-bot.yml/dispatches`;
      const dispatchRes = await fetch(dispatchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            repository: `https://github.com/${owner}/${repo}`
          }
        })
      });

      if (!dispatchRes.ok) {
        throw new Error(`Failed to trigger submission bot: ${dispatchRes.statusText}`);
      }

      setSubmitStep('bot_running');

      // 2. Poll for the Pull Request
      const branchName = `contrib-${repo.toLowerCase()}`;
      const prUrl = `https://api.github.com/repos/${targetOwner}/${targetRepo}/pulls?head=${targetOwner}:${branchName}`;
      
      let attempts = 0;
      const maxAttempts = 60; // Poll for up to 5 minutes (5s interval)
      
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(poll);
          setSubmitStep('error');
          setSubmitError('The submission bot timed out. Please check GitHub Actions for details.');
          return;
        }

        try {
          const res = await fetch(prUrl, {
            headers: {
              Accept: 'application/vnd.github.v3+json'
            }
          });
          if (res.ok) {
            const prs = await res.json();
            if (prs && prs.length > 0) {
              clearInterval(poll);
              setPrLink(prs[0].html_url);
              setSubmitStep('success');
            }
          }
        } catch (err) {
          console.error('Error polling for PR:', err);
        }
      }, 5000);

    } catch (err: any) {
      setSubmitStep('error');
      setSubmitError(err.message || 'Failed to submit repository');
    }
  };

  const allSelected = detectedSkills.length > 0 && detectedSkills.every(s => s.selected);
  const selectedCount = detectedSkills.filter(s => s.selected).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Scan Repository Bezel */}
      <div className="bezel-outer" style={{ width: '100%' }}>
        <div className="bezel-inner">
          <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FolderOpen style={{ color: '#10b981' }} /> GitHub Repository Scanner
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Scan a remote repository containing skill files (e.g. <code>owner/repository</code>). The scanner recursively scans the tree and audits files containing YAML headers.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g., https://github.com/owner/repository or owner/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isScanning}
              style={{
                flexGrow: 1,
                minWidth: '280px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-muted)',
                borderRadius: '999px',
                padding: '10px 16px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              className="btn-pill btn-secondary"
              onClick={handleScanRepository}
              disabled={isScanning}
              style={{ whiteSpace: 'nowrap' }}
            >
              {isScanning ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
              {isScanning ? 'Scanning...' : 'Scan Repository'}
            </button>
          </div>

          {scanError && (
            <div style={{ marginTop: '12px', color: 'var(--color-tier-3)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <AlertTriangle size={14} /> {scanError}
            </div>
          )}

          {scanLogs.length > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#0a0a0a',
              border: '1px solid var(--border-muted)',
              borderRadius: '8px',
              maxHeight: '180px',
              overflowY: 'auto',
              fontFamily: 'var(--mono-font)',
              fontSize: '12px',
              lineHeight: '1.6',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              color: 'var(--text-secondary)'
            }}>
              {scanLogs.map((log, idx) => (
                <div key={idx} style={{ color: log.startsWith('✨') ? '#a78bfa' : log.startsWith('✅') ? 'var(--color-tier-1)' : log.startsWith('❌') ? 'var(--color-tier-3)' : 'inherit' }}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Detected Skills & Submission Bezel */}
      {detectedSkills.length > 0 && (
        <div className="bezel-outer" style={{ width: '100%' }}>
          <div className="bezel-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <FileCheck style={{ color: '#a78bfa' }} /> Auto-Detected Skills ({detectedSkills.length})
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Preview your audited skill scores. Click the submit button to trigger the automated PR submission bot.
                </p>
              </div>

              <button
                className="btn-pill btn-primary"
                onClick={handleSubmitToGitHub}
                disabled={selectedCount === 0 || submitStep === 'triggering' || submitStep === 'bot_running'}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={14} /> Submit Repo to Leaderboard
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(167, 139, 250, 0.05)', border: '1px solid rgba(167, 139, 250, 0.2)', padding: '12px 16px', borderRadius: '8px', color: '#c084fc', fontSize: '13px', marginBottom: '16px' }}>
              <Info size={16} /> <strong>How it works:</strong> Submitting will trigger our automated GitHub Actions bot to clone your repository, run the static analysis engine, commit the skill files and leaderboard updates directly to a new branch, and open a Pull Request with a detailed scores table.
            </div>

            {/* Submission Progress Details */}
            {submitStep !== 'idle' && (
              <div style={{
                background: 'rgba(10, 10, 10, 0.9)',
                border: '1px solid var(--border-muted)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {submitStep !== 'success' && submitStep !== 'error' && <Loader2 className="animate-spin" size={14} />}
                  Submission Status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: submitStep !== 'triggering' ? 'var(--color-tier-1)' : '#5b21b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    <span style={{ color: submitStep === 'triggering' ? '#fff' : 'var(--text-secondary)' }}>Kích hoạt Bot kiểm toán (Triggering Bot)...</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: submitStep === 'triggering' ? '#334155' : (submitStep === 'bot_running' ? '#5b21b6' : 'var(--color-tier-1)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    <span style={{ color: submitStep === 'bot_running' ? '#fff' : 'var(--text-secondary)' }}>Bot đang quét, kiểm toán và tạo Pull Request (Bot running, this may take ~30s)...</span>
                  </div>
                </div>

                {submitError && (
                  <div style={{ marginTop: '16px', color: 'var(--color-tier-3)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <AlertTriangle size={14} /> {submitError}
                  </div>
                )}

                {prLink && (
                  <div style={{ marginTop: '20px', padding: '16px', background: 'var(--color-tier-1-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-tier-1)', fontSize: '15px', marginBottom: '8px' }}>Pull Request Opened Successfully!</div>
                    <a href={prLink} target="_blank" rel="noopener noreferrer" className="btn-pill btn-primary" style={{ display: 'inline-flex', padding: '8px 20px' }}>
                      View Pull Request on GitHub
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Skill Name</th>
                    <th>Source Path</th>
                    <th>Tier</th>
                    <th style={{ textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {detectedSkills.map((skill, index) => {
                    const tierClass = skill.tier === 'Tier 1' ? 'tier-1' : skill.tier === 'Tier 2' ? 'tier-2' : 'tier-3';
                    return (
                      <tr key={index} onClick={() => handleSelectSkillToggle(index)}>
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={skill.selected}
                            onChange={() => handleSelectSkillToggle(index)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ fontWeight: '600' }}>{skill.name}</td>
                        <td><code style={{ fontSize: '12px' }}>{skill.path}</code></td>
                        <td>
                          <span className={`badge-tier ${tierClass}`}>{skill.tier}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700', fontFamily: 'var(--mono-font)' }}>
                          {skill.score.toFixed(3)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
