import React, { useState } from 'react';
import { Play, Sparkles, FileUp, Key } from 'lucide-react';
import { auditSkill, auditSkillAsync, optimizeSkill } from '@skillgauge/core';

interface AuditSandboxProps {
  onShowResult: (report: any, content: string) => void;
}

const DEFAULT_TEMPLATE = `---
name: sample-skill
description: A sample agent skill instruction set to demonstrate the auditor.
---

# Sample Skill Guidelines

## Description
This is a simple guide for coding agents. Try to write clean code. You should check for errors.

## Steps
1. Firstly, analyze the files.
2. Secondly, write the code.
3. Thirdly, run validation tests.
`;

export const AuditSandbox: React.FC<AuditSandboxProps> = ({ onShowResult }) => {
  const [content, setContent] = useState(DEFAULT_TEMPLATE);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAudit = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let report;
      if (apiKey.trim()) {
        report = await auditSkillAsync(content, apiKey);
      } else {
        report = auditSkill(content);
      }
      onShowResult(report, content);
    } catch (err: any) {
      setErrorMsg(err.message || 'Audit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const optimized = await optimizeSkill(content, apiKey.trim() || undefined);
      setContent(optimized);
      
      // Run audit on optimized
      let report;
      if (apiKey.trim()) {
        report = await auditSkillAsync(optimized, apiKey);
      } else {
        report = auditSkill(optimized);
      }
      onShowResult(report, optimized);
    } catch (err: any) {
      setErrorMsg(err.message || 'Optimization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setContent(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bezel-outer" style={{ width: '100%' }}>
      <div className="bezel-inner sandbox-editor">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="section-subtitle" style={{ marginBottom: '4px' }}>Interactive Sandbox Auditor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Paste your prompt, upload a file, or write instructions directly to see real-time scores and optimize your directives.
            </p>
          </div>
          <label className="btn-pill btn-secondary" style={{ cursor: 'pointer' }}>
            <FileUp size={14} /> Upload SKILL.md
            <input type="file" accept=".md" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
            <Key size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="password"
              placeholder="Gemini API Key (Optional - unlocks deep semantic LLM checks)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-muted)',
                borderRadius: '999px',
                padding: '8px 12px 8px 36px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <textarea
          className="editor-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {errorMsg && (
          <div style={{ color: 'var(--color-tier-3)', fontSize: '13px', background: 'var(--color-tier-3-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px' }}>
            {errorMsg}
          </div>
        )}

        <div className="editor-actions">
          <button
            className="btn-pill btn-secondary"
            onClick={handleOptimize}
            disabled={isLoading || !content.trim()}
          >
            <Sparkles size={14} />
            Optimize Rules
            <span className="btn-icon-wrapper">🪄</span>
          </button>
          
          <button
            className="btn-pill btn-primary"
            onClick={handleAudit}
            disabled={isLoading || !content.trim()}
          >
            <Play size={14} />
            {isLoading ? 'Analyzing...' : 'Audit Prompt'}
            <span className="btn-icon-wrapper">🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
