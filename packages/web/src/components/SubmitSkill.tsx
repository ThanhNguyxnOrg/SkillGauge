import React, { useState, useEffect } from 'react';
import { Github, Key, Search, Send, CheckCircle2, AlertTriangle, Loader2, FolderOpen, FileCheck, Info } from 'lucide-react';
import { auditSkill, getGitHubUser, forkRepository, commitFile, createPullRequest } from '@skillgauge/core';

interface DetectedSkill {
  path: string;
  name: string;
  content: string;
  score: number;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  selected: boolean;
}

export const SubmitSkill: React.FC = () => {
  const [token, setToken] = useState(() => localStorage.getItem('skillgauge_github_pat') || '');
  const [repoUrl, setRepoUrl] = useState('');
  const [user, setUser] = useState<any | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [detectedSkills, setDetectedSkills] = useState<DetectedSkill[]>([]);
  const [scanError, setScanError] = useState('');

  const [submitStep, setSubmitStep] = useState<'idle' | 'forking' | 'branching' | 'committing' | 'pr' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [submitLogs, setSubmitLogs] = useState<string[]>([]);
  const [prLink, setPrLink] = useState('');

  // Validate token on mount if exists
  useEffect(() => {
    if (token) {
      validateGitHubToken(token);
    }
  }, []);

  const validateGitHubToken = async (pat: string) => {
    setIsValidatingToken(true);
    setTokenError('');
    try {
      const gitUser = await getGitHubUser(pat);
      setUser(gitUser);
      localStorage.setItem('skillgauge_github_pat', pat);
    } catch (err: any) {
      setTokenError(err.message || 'Invalid GitHub token');
      setUser(null);
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleSaveToken = () => {
    if (token.trim()) {
      validateGitHubToken(token.trim());
    } else {
      setUser(null);
      localStorage.removeItem('skillgauge_github_pat');
    }
  };

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
        headers: token ? {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'SkillGauge-App'
        } : {
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
        headers: token ? {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'SkillGauge-App'
        } : {
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
            headers: token ? {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3.raw',
              'User-Agent': 'SkillGauge-App'
            } : {
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

  const createBranchIfNotExists = async (pat: string, owner: string, repo: string, branch: string) => {
    // 1. Get main branch SHA
    const mainRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`, {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'SkillGauge-App'
      }
    });
    
    let baseSha = '';
    if (mainRes.ok) {
      const data = await mainRes.json();
      baseSha = data.object.sha;
    } else {
      // Try master as fallback
      const masterRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/master`, {
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'SkillGauge-App'
        }
      });
      if (masterRes.ok) {
        const data = await masterRes.json();
        baseSha = data.object.sha;
      }
    }

    if (!baseSha) {
      throw new Error('Could not resolve main/master branch SHA from fork repository.');
    }

    // 2. Create the reference
    const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'SkillGauge-App'
      },
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: baseSha
      })
    });

    if (!createRes.ok && createRes.status !== 422) {
      throw new Error(`Failed to create branch "${branch}": ${createRes.statusText}`);
    }
  };

  const handleSelectSkillToggle = (index: number) => {
    setDetectedSkills(prev => prev.map((s, idx) => idx === index ? { ...s, selected: !s.selected } : s));
  };

  const handleSelectAll = (val: boolean) => {
    setDetectedSkills(prev => prev.map(s => ({ ...s, selected: val })));
  };

  const handlePushToGitHub = async () => {
    const selectedSkills = detectedSkills.filter(s => s.selected);
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill to submit.');
      return;
    }
    if (!user || !token) {
      alert('Please log in with your GitHub Personal Access Token first.');
      return;
    }

    setSubmitStep('forking');
    setSubmitError('');
    setSubmitLogs(['Verifying GitHub credentials...', `Authenticated as @${user.login}`]);
    setPrLink('');

    try {
      const { owner: sourceOwner, repo: sourceRepo } = parseGitUrl(repoUrl);
      const targetOwner = 'ThanhNguyxnOrg';
      const targetRepo = 'SkillGauge';
      const branchName = `contrib-${sourceRepo}-${Date.now().toString().slice(-4)}`;

      // 1. Fork target repository
      setSubmitLogs(prev => [...prev, `Triggering fork of ${targetOwner}/${targetRepo} to your account...`]);
      await forkRepository(token, targetOwner, targetRepo);
      
      setSubmitLogs(prev => [...prev, `Waiting 3 seconds for GitHub to set up the fork...`]);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. Create custom branch
      setSubmitStep('branching');
      setSubmitLogs(prev => [...prev, `Creating custom branch "${branchName}" on your fork...`]);
      await createBranchIfNotExists(token, user.login, targetRepo, branchName);

      // 3. Commit each selected file
      setSubmitStep('committing');
      for (const skill of selectedSkills) {
        const basename = skill.path.split('/').pop() || skill.path;
        const targetPath = `skills/${sourceRepo}/${basename}`;
        setSubmitLogs(prev => [...prev, `Committing file "${basename}" to "${targetPath}"...`]);
        await commitFile(
          token,
          user.login,
          targetRepo,
          targetPath,
          skill.content,
          branchName,
          `Add skill ${skill.name} from repository ${sourceOwner}/${sourceRepo}`
        );
      }

      // 4. Create Pull Request
      setSubmitStep('pr');
      setSubmitLogs(prev => [...prev, `Opening Pull Request to ${targetOwner}/${targetRepo}...`]);
      const prTitle = `Submit skills from ${sourceOwner}/${sourceRepo}`;
      const prBody = `This PR was automatically generated by the SkillGauge Web Dashboard.\n\nIt adds the following audited skills from the repository [${sourceOwner}/${sourceRepo}](https://github.com/${sourceOwner}/${sourceRepo}):\n\n` +
        selectedSkills.map(s => `- **${s.name}** (Path: \`${s.path}\`, Score: **${s.score.toFixed(3)}**, **${s.tier}**)`).join('\n');

      const pr = await createPullRequest(
        token,
        targetOwner,
        targetRepo,
        `${user.login}:${branchName}`,
        'main',
        prTitle,
        prBody
      );

      setPrLink(pr.html_url);
      setSubmitStep('success');
      setSubmitLogs(prev => [...prev, `🎉 Successfully created Pull Request!`, `PR Link: ${pr.html_url}`]);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to complete submission flow');
      setSubmitStep('error');
      setSubmitLogs(prev => [...prev, `❌ Error: ${err.message}`]);
    }
  };

  const allSelected = detectedSkills.length > 0 && detectedSkills.every(s => s.selected);
  const selectedCount = detectedSkills.filter(s => s.selected).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Login Bezel */}
      <div className="bezel-outer" style={{ width: '100%' }}>
        <div className="bezel-inner">
          <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Key style={{ color: '#a78bfa' }} /> GitHub Authentication
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Enter a Personal Access Token (PAT) with <code>public_repo</code> permissions. The token is stored locally in your browser and never leaves your machine.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isValidatingToken}
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
              className="btn-pill btn-primary"
              onClick={handleSaveToken}
              disabled={isValidatingToken}
              style={{ whiteSpace: 'nowrap' }}
            >
              {isValidatingToken ? <Loader2 className="animate-spin" size={14} /> : <Github size={14} />}
              {user ? 'Update Token' : 'Log In'}
            </button>
          </div>

          {tokenError && (
            <div style={{ marginTop: '12px', color: 'var(--color-tier-3)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <AlertTriangle size={14} /> {tokenError}
            </div>
          )}

          {user && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-muted)' }}>
              <img
                src={user.avatar_url}
                alt={user.login}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-muted)' }}
              />
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Authenticated as @{user.login}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PRs will be submitted from your account</div>
              </div>
              <CheckCircle2 size={16} style={{ color: 'var(--color-tier-1)', marginLeft: 'auto' }} />
            </div>
          )}
        </div>
      </div>

      {/* 2. Scan Repository Bezel */}
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

      {/* 3. Detected Skills & Submission Bezel */}
      {detectedSkills.length > 0 && (
        <div className="bezel-outer" style={{ width: '100%' }}>
          <div className="bezel-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <FileCheck style={{ color: '#a78bfa' }} /> Auto-Detected Skills ({detectedSkills.length})
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Select which audited files you want to commit and submit.
                </p>
              </div>

              {user && (
                <button
                  className="btn-pill btn-primary"
                  onClick={handlePushToGitHub}
                  disabled={selectedCount === 0 || submitStep === 'forking' || submitStep === 'branching' || submitStep === 'committing' || submitStep === 'pr'}
                >
                  <Send size={14} /> Push {selectedCount} Skills to Leaderboard
                </button>
              )}
            </div>

            {!user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 16px', borderRadius: '8px', color: 'var(--color-tier-2)', fontSize: '13px', marginBottom: '16px' }}>
                <Info size={16} /> Log in using your GitHub token above to enable submissions.
              </div>
            )}

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
                  Submission Progress
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: submitStep !== 'forking' ? 'var(--color-tier-1)' : '#5b21b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    <span style={{ color: submitStep === 'forking' ? '#fff' : 'var(--text-secondary)' }}>Forking SkillGauge repository</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: submitStep === 'forking' ? '#334155' : (submitStep === 'branching' ? '#5b21b6' : 'var(--color-tier-1)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    <span style={{ color: submitStep === 'branching' ? '#fff' : 'var(--text-secondary)' }}>Creating branch</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: (submitStep === 'forking' || submitStep === 'branching') ? '#334155' : (submitStep === 'committing' ? '#5b21b6' : 'var(--color-tier-1)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    <span style={{ color: submitStep === 'committing' ? '#fff' : 'var(--text-secondary)' }}>Committing files</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: (submitStep === 'success') ? 'var(--color-tier-1)' : (submitStep === 'pr' ? '#5b21b6' : '#334155'), display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    <span style={{ color: submitStep === 'pr' ? '#fff' : 'var(--text-secondary)' }}>Creating consolidated Pull Request</span>
                  </div>
                </div>

                {submitLogs.length > 0 && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#0a0a0a',
                    border: '1px solid var(--border-muted)',
                    borderRadius: '6px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    fontFamily: 'var(--mono-font)',
                    fontSize: '11px',
                    lineHeight: '1.5',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {submitLogs.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                )}

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
