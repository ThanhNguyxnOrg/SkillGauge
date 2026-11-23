import React, { useState } from 'react';
import { Send, AlertTriangle, Loader2, FolderOpen, CheckCircle, Info, Key, Terminal, ExternalLink, Zap } from 'lucide-react';

// Self-contained parser for extracting YAML frontmatter and tests block
interface ParsedTest {
  [key: string]: string | string[] | boolean;
}

interface ParsedMetadata {
  name?: string;
  description?: string;
  tests?: ParsedTest[];
}

interface PrSkill {
  name: string;
  filePath: string;
  rawText: string;
  tests: ParsedTest[];
}

function parseFrontmatter(markdown: string) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { metadata: {} as ParsedMetadata, body: markdown };
  const yamlText = match[1];
  const body = markdown.substring(match[0].length);

  const metadata: ParsedMetadata = {};
  const lines = yamlText.split('\n');
  let inTests = false;
  let currentTest: ParsedTest | null = null;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    if (line.startsWith('name:')) {
      metadata.name = line.substring(5).trim().replace(/^['"]|['"]$/g, '');
      inTests = false;
    } else if (line.startsWith('description:')) {
      metadata.description = line.substring(12).trim().replace(/^['"]|['"]$/g, '');
      inTests = false;
    } else if (line.startsWith('tests:')) {
      metadata.tests = [];
      inTests = true;
    } else if (inTests && line.startsWith('-')) {
      currentTest = {};
      (metadata.tests as ParsedTest[]).push(currentTest);
      
      const rest = line.substring(1).trim();
      if (rest) {
        parseYamlLine(rest, currentTest);
      }
    } else if (inTests && currentTest) {
      parseYamlLine(line, currentTest);
    }
  }
  
  function parseYamlLine(line: string, testObj: ParsedTest) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.substring(0, colonIdx).trim();
    let val = line.substring(colonIdx + 1).trim();
    
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        testObj[key] = val
          .substring(1, val.length - 1)
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      } catch {
        testObj[key] = [val];
      }
    } else {
      val = val.replace(/^['"]|['"]$/g, '');
      if (val === 'true') testObj[key] = true;
      else if (val === 'false') testObj[key] = false;
      else testObj[key] = val;
    }
  }
  
  return { metadata, body };
}

export const SubmitSkill: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [submitStep, setSubmitStep] = useState<'idle' | 'awaiting_approval' | 'bot_running' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [prLink, setPrLink] = useState('');

  // Dynamic test states
  const [prSkills, setPrSkills] = useState<PrSkill[]>([]);
  const [dynamicRunning, setDynamicRunning] = useState(false);
  const [dynamicConsoleLogs, setDynamicConsoleLogs] = useState<string[]>([]);

  const parseGitUrl = (url: string): { owner: string; repo: string } => {
    const normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.includes('@') && normalized.includes('/')) {
      const parts = normalized.split('/');
      if (parts.length === 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }
    const match = normalized.match(/(?:github\.com[/:])([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
    if (!match) {
      throw new Error(`Unsupported Git repository URL or identifier "${url}". Use "owner/repo" or a GitHub HTTPS URL.`);
    }
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  };

  const fetchPrFiles = async (prNumber: number) => {
    try {
      const response = await fetch(`https://api.github.com/repos/ThanhNguyxnOrg/SkillGauge/pulls/${prNumber}/files`);
      if (!response.ok) return;
      const files = await response.json();
      
      const skillsToTest: PrSkill[] = [];
      for (const file of files) {
        if (file.filename.startsWith('skills/') && file.filename.endsWith('.md')) {
          const rawRes = await fetch(file.raw_url);
          if (rawRes.ok) {
            const rawContent = await rawRes.text();
            const { metadata } = parseFrontmatter(rawContent);
            if (metadata.tests && metadata.tests.length > 0) {
              skillsToTest.push({
                name: metadata.name || file.filename.split('/').pop().replace('.md', ''),
                filePath: file.filename,
                rawText: rawContent,
                tests: metadata.tests
              });
            }
          }
        }
      }
      setPrSkills(skillsToTest);
    } catch (err) {
      console.error('Error fetching PR files:', err);
    }
  };

  const runBrowserDynamicTests = async () => {
    if (!geminiApiKey.trim()) {
      alert('Please enter your Gemini API Key first.');
      return;
    }
    
    setDynamicRunning(true);
    setDynamicConsoleLogs([]);
    const logs: string[] = [];

    const addLog = (msg: string) => {
      logs.push(msg);
      setDynamicConsoleLogs([...logs]);
    };

    addLog('🧪 Starting browser-based dynamic runtime prompt testing...');

    for (const skill of prSkills) {
      addLog(`\n📦 Skill: ${skill.name} (${skill.filePath})`);
      
      for (let idx = 0; idx < skill.tests.length; idx++) {
        const test = skill.tests[idx];
        const scenario = test.scenario || `Scenario ${idx + 1}`;
        const input = test.input || '';
        const expectedList = Array.isArray(test.expected) ? test.expected : test.expected ? [String(test.expected)] : [];
        const expectedNotList = Array.isArray(test.expected_not) ? test.expected_not : test.expected_not ? [String(test.expected_not)] : [];

        addLog(`  🔄 Running Scenario: "${scenario}"`);
        addLog(`     Input: "${input}"`);

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiApiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: input }]
                }
              ],
              systemInstruction: {
                parts: [{ text: skill.rawText }]
              }
            })
          });

          if (!response.ok) {
            throw new Error(`Gemini API call failed with status: ${response.status}`);
          }

          const resJson = await response.json();
          const outputText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const lowerOutput = outputText.toLowerCase();

          addLog(`     Output: "${outputText.substring(0, 150).trim()}..."`);

          let scenarioPassed = true;
          for (const kw of expectedList) {
            const passed = lowerOutput.includes(kw.toLowerCase());
            if (passed) {
              addLog(`     ✅ Expected keyword check: "${kw}" - PASS`);
            } else {
              addLog(`     ❌ Expected keyword check: "${kw}" - FAIL`);
              scenarioPassed = false;
            }
          }

          for (const kw of expectedNotList) {
            const passed = !lowerOutput.includes(kw.toLowerCase());
            if (passed) {
              addLog(`     ✅ Negative keyword shield check: NOT "${kw}" - PASS`);
            } else {
              addLog(`     ❌ Negative keyword shield check: NOT "${kw}" - FAIL`);
              scenarioPassed = false;
            }
          }

          if (scenarioPassed) {
            addLog(`  🟢 Scenario "${scenario}" PASSED`);
          } else {
            addLog(`  🔴 Scenario "${scenario}" FAILED`);
          }
        } catch (err: unknown) {
          addLog(`  🔴 Scenario "${scenario}" ERRORED: ${err instanceof Error ? err.message : 'unknown error'}`);
        }
      }
    }
    
    addLog('\n🏁 Browser dynamic testing complete.');
    setDynamicRunning(false);
  };

  const handleSubmitToGitHub = async () => {
    if (!repoUrl.trim()) {
      setSubmitError('Please enter a repository URL or owner/repo shorthand.');
      return;
    }

    setSubmitStep('awaiting_approval');
    setSubmitError('');
    setPrLink('');
    setPrSkills([]);
    setDynamicConsoleLogs([]);

    let prPoll: ReturnType<typeof setInterval> | null = null;

    const clearAllIntervals = () => {
      if (prPoll) clearInterval(prPoll);
    };

    try {
      const { owner, repo } = parseGitUrl(repoUrl);
      const targetOwner = 'ThanhNguyxnOrg';
      const targetRepo = 'SkillGauge';

      // No credentials are baked into this site: the submission is a
      // pre-filled GitHub issue that a maintainer approves by applying the
      // `submission-request` label, which runs submit-repo-bot.yml.
      const issueTitle = `[Submission] ${owner}/${repo}`;
      const issueBody = [
        'Repository submission requested from the SkillGauge web dashboard.',
        '',
        `repository: https://github.com/${owner}/${repo}`,
        '',
        'A maintainer applies the `submission-request` label to start the audit bot.'
      ].join('\n');
      window.open(
        `https://github.com/${targetOwner}/${targetRepo}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`,
        '_blank',
        'noopener'
      );

      // Poll for the Pull Request the bot opens (public, unauthenticated).
      const slug = `${owner}-${repo}`.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
      const branchName = `contrib-${slug}`;
      const prUrl = `https://api.github.com/repos/${targetOwner}/${targetRepo}/pulls?head=${targetOwner}:${branchName}`;

      let attempts = 0;
      const maxAttempts = 60;

      prPoll = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearAllIntervals();
          setSubmitStep('error');
          setSubmitError('Still waiting — the bot runs once a maintainer applies the `submission-request` label on your issue. You can submit again to keep watching for the PR.');
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
              clearAllIntervals();
              const prInfo = prs[0];
              setPrLink(prInfo.html_url);
              setSubmitStep('success');

              // Load PR files and test specification definitions
              fetchPrFiles(prInfo.number);
            }
          }
        } catch (err) {
          console.error('Error polling for PR:', err);
        }
      }, 30000);

    } catch (err: unknown) {
      clearAllIntervals();
      setSubmitStep('error');
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit repository');
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
            Submit a public GitHub repository containing agent skill markdown files (e.g., Anthropic-style <code>SKILL.md</code> or files with YAML headers under <code>skills/</code>). Submitting opens a pre-filled GitHub issue that you file from your own GitHub account; once a maintainer approves it, our automated bot clones, audits, and opens a Pull Request for you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Repository shorthand: owner/repo (e.g. obra/superpowers)"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={submitStep === 'awaiting_approval' || submitStep === 'bot_running'}
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
                disabled={submitStep === 'awaiting_approval' || submitStep === 'bot_running'}
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {submitStep === 'awaiting_approval' || submitStep === 'bot_running' ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Send size={14} />
                )}
                {submitStep === 'awaiting_approval' || submitStep === 'bot_running' ? 'Submitting...' : 'Submit Repository'}
              </button>
            </div>

            {/* Optional API Key configuration */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-muted)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                <Key size={14} style={{ color: '#a78bfa' }} /> Gemini API Key (Optional)
              </label>
              <input
                type="password"
                placeholder="Enter Gemini API Key to run dynamic tests locally in the browser"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  width: '100%'
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Your API key remains local to your browser and is only used to directly query Google Gemini API.
              </span>
            </div>
          </div>

          {submitError && (
            <div style={{ marginTop: '16px', color: 'var(--color-tier-3)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <AlertTriangle size={16} /> {submitError}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'start', gap: '12px', background: 'rgba(167, 139, 250, 0.05)', border: '1px solid rgba(167, 139, 250, 0.15)', padding: '16px', borderRadius: '12px', color: '#c084fc', fontSize: '13px', marginTop: '16px' }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <strong>How the Submission works:</strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                1. Clicking submit opens a pre-filled GitHub issue for you to file while signed in to GitHub; a maintainer approves it by applying the <code>submission-request</code> label.
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                2. The bot then clones your repo, audits all valid skills against the 390-signal static matrix, and opens a Pull Request.
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                3. Dynamic runtime tests run automatically on the PR, or instantly in the browser with your own Gemini API key.
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
              {/* Step 1: Submission issue filed */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--color-tier-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  ✓
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Submission issue opened on GitHub.
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    File it by confirming the pre-filled issue in the new tab.
                  </span>
                </div>
              </div>

              {/* Step 2: Maintainer approval + bot run */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: submitStep === 'awaiting_approval' || submitStep === 'bot_running' ? '#5b21b6' : 'var(--color-tier-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {submitStep === 'awaiting_approval' || submitStep === 'bot_running' ? '2' : '✓'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: submitStep === 'bot_running' ? '700' : '400', color: submitStep === 'bot_running' ? '#fff' : 'var(--text-secondary)' }}>
                    Awaiting maintainer approval & bot audit...
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    The bot starts when a maintainer applies the `submission-request` label, then audits the 390-signal static matrix.
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



            {/* Dynamic Prompts Verification Console (Step 4) */}
            {submitStep === 'success' && prSkills.length > 0 && (
              <div style={{
                marginTop: '24px',
                padding: '20px',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                background: 'rgba(139, 92, 246, 0.02)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} style={{ color: '#a78bfa' }} /> Step 4: Dynamic Runtime Verification
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  We found <strong>{prSkills.length}</strong> skill prompt file(s) with dynamic test scenarios. Dynamic tests also run automatically on the PR via GitHub Actions.
                </p>

                {/* API Key Present or Missing Action Panel */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {geminiApiKey && (
                    <button
                      className="btn-pill btn-primary"
                      onClick={runBrowserDynamicTests}
                      disabled={dynamicRunning}
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {dynamicRunning ? <Loader2 className="animate-spin" size={13} /> : <Terminal size={13} />}
                      Run Browser-Based Dynamic Tests
                    </button>
                  )}
                  <a
                    href="https://github.com/ThanhNguyxnOrg/SkillGauge/actions/workflows/dynamic-tests.yml"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#a78bfa', textDecoration: 'underline' }}
                  >
                    View CI Dynamic Tests <ExternalLink size={13} />
                  </a>
                </div>

                {/* Local Browser Logs Terminal */}
                {dynamicConsoleLogs.length > 0 && (
                  <div style={{
                    padding: '16px',
                    background: '#050505',
                    border: '1px solid var(--border-muted)',
                    borderRadius: '8px',
                    fontFamily: 'var(--mono-font)',
                    fontSize: '11px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    color: '#a7f3d0'
                  }}>
                    {dynamicConsoleLogs.join('\n')}
                  </div>
                )}


              </div>
            )}

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
