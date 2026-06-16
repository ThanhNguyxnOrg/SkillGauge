import React, { useState } from 'react';
import { Send, AlertTriangle, Loader2, FolderOpen, CheckCircle, Info } from 'lucide-react';

export const SubmitSkill: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
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

  const handleSubmitToGitHub = async () => {
    if (!repoUrl.trim()) {
      setSubmitError('Please enter a repository URL or owner/repo shorthand.');
      return;
    }

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="bezel-outer" style={{ width: '100%' }}>
        <div className="bezel-inner">
          <h2 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FolderOpen style={{ color: '#10b981' }} /> Leaderboard Repository Submitter
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Submit a public GitHub repository containing agent skill markdown files (e.g., Anthropic-style <code>SKILL.md</code> or files with YAML headers under <code>skills/</code>). Our automated bot will clone, audit, optimize, and generate a Pull Request for you.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g., https://github.com/owner/repository or owner/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={submitStep === 'triggering' || submitStep === 'bot_running'}
              style={{
                flexGrow: 1,
                minWidth: '280px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-muted)',
                borderRadius: '999px',
                padding: '12px 18px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              className="btn-pill btn-primary"
              onClick={handleSubmitToGitHub}
              disabled={submitStep === 'triggering' || submitStep === 'bot_running'}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {submitStep === 'triggering' || submitStep === 'bot_running' ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Send size={14} />
              )}
              {submitStep === 'triggering' || submitStep === 'bot_running' ? 'Submitting...' : 'Submit Repository'}
            </button>
          </div>

          {submitError && (
            <div style={{ marginTop: '16px', color: 'var(--color-tier-3)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <AlertTriangle size={16} /> {submitError}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'start', gap: '12px', background: 'rgba(167, 139, 250, 0.05)', border: '1px solid rgba(167, 139, 250, 0.15)', padding: '16px', borderRadius: '12px', color: '#c084fc', fontSize: '13px', marginTop: '24px' }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <strong>How the Submission works:</strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                1. Clicking submit triggers our remote GitHub Actions runner bot.
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                2. The bot clones your repo, scans for markdown files starting with <code>---</code> YAML frontmatter containing <code>name:</code> and <code>description:</code>.
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                3. The bot grades the files, updates the leaderboard ranking, and creates a Pull Request.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Status Panel */}
      {submitStep !== 'idle' && (
        <div className="bezel-outer" style={{ width: '100%' }}>
          <div className="bezel-inner" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {submitStep !== 'success' && submitStep !== 'error' ? (
                <Loader2 className="animate-spin" style={{ color: '#a78bfa' }} size={16} />
              ) : submitStep === 'success' ? (
                <CheckCircle style={{ color: 'var(--color-tier-1)' }} size={16} />
              ) : (
                <AlertTriangle style={{ color: 'var(--color-tier-3)' }} size={16} />
              )}
              Submission Status & Progress
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {/* Step 1: Trigger Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: submitStep === 'triggering' ? '#5b21b6' : 'var(--color-tier-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {submitStep === 'triggering' ? '1' : '✓'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: submitStep === 'triggering' ? '700' : '400', color: submitStep === 'triggering' ? '#fff' : 'var(--text-secondary)' }}>
                    Triggering Auditing Runner...
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Calling GitHub Actions dispatch API.
                  </span>
                </div>
              </div>

              {/* Step 2: Bot Auditing */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: submitStep === 'triggering' ? '#334155' : (submitStep === 'bot_running' ? '#5b21b6' : 'var(--color-tier-1)'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {submitStep === 'triggering' ? '2' : (submitStep === 'bot_running' ? '2' : '✓')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: submitStep === 'bot_running' ? '700' : '400', color: submitStep === 'bot_running' ? '#fff' : 'var(--text-secondary)' }}>
                    Cloning & Auditing Repository...
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    The runner is cloning your repository and evaluating files against the 100-criteria matrix.
                  </span>
                </div>
              </div>

              {/* Step 3: Pull Request Creation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: submitStep === 'success' ? 'var(--color-tier-1)' : (submitStep === 'error' ? 'var(--color-tier-3)' : '#334155'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {submitStep === 'success' ? '✓' : '3'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: submitStep === 'success' ? '700' : '400', color: submitStep === 'success' ? '#fff' : 'var(--text-secondary)' }}>
                    Creating Pull Request...
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Generating submission branch and creating Pull Request with audit details.
                  </span>
                </div>
              </div>
            </div>

            {prLink && (
              <div style={{
                marginTop: '24px',
                padding: '20px',
                background: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontWeight: '700', color: 'var(--color-tier-1)', fontSize: '15px' }}>
                  🎉 Pull Request Opened Successfully!
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                  Your submission has been evaluated and a Pull Request is ready. Check the audit report in the PR description!
                </p>
                <a
                  href={prLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill btn-primary"
                  style={{ display: 'inline-flex', padding: '10px 24px', textDecoration: 'none', fontWeight: '600' }}
                >
                  View Pull Request on GitHub
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
