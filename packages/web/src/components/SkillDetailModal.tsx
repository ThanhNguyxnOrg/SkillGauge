import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, BookOpen, Compass } from 'lucide-react';

interface AuditReport {
  name?: string;
  overallScore: number;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  dimensions: {
    dimA: number;
    dimB: number;
    dimC: number;
    dimD: number;
    dimE: number;
    dimF: number;
    dimG: number;
  };
  scores: { [key: string]: number };
  explanation?: string;
}

interface SkillDetailModalProps {
  report: AuditReport | null;
  skillName: string;
  content: string;
  onClose: () => void;
}

const DIMENSION_METADATA = [
  { id: 'dimA', name: 'Dimension A: Instruction Quality & Clarity', max: 15, prefix: 'A', count: 15 },
  { id: 'dimB', name: 'Dimension B: Context & Memory Management', max: 15, prefix: 'B', count: 15 },
  { id: 'dimC', name: 'Dimension C: Safety, Alignment & Security', max: 15, prefix: 'C', count: 15 },
  { id: 'dimD', name: 'Dimension D: Tool-Use & MCP Clarity', max: 15, prefix: 'D', count: 15 },
  { id: 'dimE', name: 'Dimension E: Robustness & Exception Handling', max: 15, prefix: 'E', count: 15 },
  { id: 'dimF', name: 'Dimension F: Operational & Inference Economy', max: 15, prefix: 'F', count: 15 },
  { id: 'dimG', name: 'Dimension G: Syntax, Structure & Metadata', max: 10, prefix: 'G', count: 10 },
];

const METRICS_DICTIONARY: { [key: string]: { name: string; desc: string } } = {
  // Dim A
  A1: { name: 'Imperative Verb Density', desc: 'Checks density of action verbs (run, perform, verify).' },
  A2: { name: 'Passive Voice Penalty', desc: 'Penalizes passive constructs to ensure direct agent instruction.' },
  A3: { name: 'Qualifier Ambiguity', desc: 'Checks balance of strong vs weak qualifiers (must/never vs should/could).' },
  A4: { name: 'Adverb Bloat', desc: 'Checks for filler adverbs ending in -ly that bloat tokens.' },
  A5: { name: 'Readability Index', desc: 'Flesch-Kincaid readabilty score normalized for AI comprehension.' },
  A6: { name: 'Sentence Length Variance', desc: 'Measures sentence variety to keep attention weights balanced.' },
  A7: { name: 'Structural Symmetry', desc: 'Penalizes mixing different bullet types (*, -, +) in the file.' },
  A8: { name: 'Noun Concreteness', desc: 'Checks ratio of concrete vs abstract terms.' },
  A9: { name: 'Goal Specificity', desc: 'Checks if target format specifications are explicitly defined.' },
  A10: { name: 'Pronoun Clarity', desc: 'Penalizes unreferenced pronouns (it, they, them).' },
  A11: { name: 'Semantic Drift Guard', desc: 'Checks for contradictory instructions (always X vs never X).' },
  A12: { name: 'Jargon Density', desc: 'Penalizes unexplained complex jargon.' },
  A13: { name: 'Positive Directive Balance', desc: 'Evaluates balance of positive DO actions.' },
  A14: { name: 'Scope Boundary Clarity', desc: 'Verifies existence of out-of-scope boundaries.' },
  A15: { name: 'Temporal Consistency', desc: 'Checks sequential ordering terms (step 1, step 2).' },
  // Dim B
  B1: { name: 'Token Friction Weight', desc: 'Checks total token count (optimizes between 600 and 2000 tokens).' },
  B2: { name: 'Information Density', desc: 'Excludes standard stop-words to measure core keyword weights.' },
  B3: { name: 'Lost-in-the-Middle Guard', desc: 'Checks if key instructions are placed near the middle.' },
  B4: { name: 'Nested List Depth', desc: 'Penalizes nested lists deeper than 3 layers.' },
  B5: { name: 'Reference Validity', desc: 'Validates integrity of internal header links.' },
  B6: { name: 'Code Block Density', desc: 'Validates code example ratio (targets 10% to 40%).' },
  B7: { name: 'XML Tag Matching', desc: 'Ensures all XML formatting tags open and close properly.' },
  B8: { name: 'Schema Completeness', desc: 'Checks parameter type declarations and required fields.' },
  B9: { name: 'Context Pruning Directives', desc: 'Checks for clear state cleaning/forget rules.' },
  B10: { name: 'Variable Allocation', desc: 'Ensures all template variables are declared correctly.' },
  B11: { name: 'Logging Frequency Directives', desc: 'Verifies instructions to log state details.' },
  B12: { name: 'Checkpoint Frequency', desc: 'Ensures execution state checkpoints are defined.' },
  B13: { name: 'Redundancy Line Penalty', desc: 'Checks for repeated lines or duplicate rules.' },
  B14: { name: 'Stop-Word Saturation', desc: 'Checks for over-saturation of empty filler tokens.' },
  B15: { name: 'History Size Constraints', desc: 'Checks if context size limits are defined.' },
  // Dim C
  C1: { name: 'Prompt Injection Shield', desc: 'Checks for user input ignore directives.' },
  C2: { name: 'System Instruction Protection', desc: 'Checks for directives preventing leakage.' },
  C3: { name: 'Role Hijacking Defense', desc: 'Ensures role boundaries are strictly locked.' },
  C4: { name: 'Jailbreak Resistance Keywords', desc: 'Validates guardrails for adversarial queries.' },
  C5: { name: 'Exfiltration Defense', desc: 'Blocks exfiltration of secrets to external hosts.' },
  C6: { name: 'PII Masking Instructions', desc: 'Checks for rules shielding personal data.' },
  C7: { name: 'Sandbox Constraints', desc: 'Ensures command execution runs inside a sandbox.' },
  C8: { name: 'Command Authority Scope', desc: 'Limits executing commands without user approval.' },
  C9: { name: 'Compliance Rules', desc: 'Validates policy alignment guidelines.' },
  C10: { name: 'Input Sanitization Instructions', desc: 'Ensures input parameters are sanitized.' },
  C11: { name: 'Output Validation Directives', desc: 'Checks if output format checks are defined.' },
  C12: { name: 'Trust Boundary Checking', desc: 'Verifies checking validity of API nodes.' },
  C13: { name: 'Access Control Rules', desc: 'Ensures roles are checked before performing actions.' },
  C14: { name: 'Override Blockers', desc: 'Blocks bypassing rules via system variables.' },
  C15: { name: 'Log Obfuscation', desc: 'Ensures sensitive credentials are hidden in logs.' },
  // Dim D
  D1: { name: 'Parameter Spec Clarity', desc: 'Verifies parameter types are specified.' },
  D2: { name: 'Required Field Spec', desc: 'Checks if required arguments are marked.' },
  D3: { name: 'Argument Description Quality', desc: 'Ensures parameter descriptions are descriptive.' },
  D4: { name: 'Parallel Call Control', desc: 'Validates parallel tool call handlers.' },
  D5: { name: 'Rate Limit Guidelines', desc: 'Validates handling server status codes.' },
  D6: { name: 'Error Response Handling', desc: 'Validates error keywords usage.' },
  D7: { name: 'Tool Output Parsers', desc: 'Checks if output extraction rules are defined.' },
  D8: { name: 'Tool Selection Logic', desc: 'Checks if criteria for picking tools are defined.' },
  D9: { name: 'Input Encoding Specifications', desc: 'Ensures format encodings (e.g. UTF-8) are declared.' },
  D10: { name: 'Execution Sequence Constraints', desc: 'Checks if dependencies are structured in a DAG.' },
  D11: { name: 'Fail-safe Defaults', desc: 'Ensures default fallbacks are declared.' },
  D12: { name: 'Schema Conformance Checks', desc: 'Ensures API outputs conform to expected schema.' },
  D13: { name: 'Payload Size Limits', desc: 'Checks if payload volume checks are defined.' },
  D14: { name: 'Callback Specifications', desc: 'Verifies async execution response handlers.' },
  D15: { name: 'Resource Clean-up', desc: 'Checks if temp file deleting instructions are defined.' },
  // Dim E
  E1: { name: 'Exception Catcher', desc: 'Verifies presence of crash catching rules.' },
  E2: { name: 'Exit Strategy', desc: 'Checks if abort/exit commands are declared.' },
  E3: { name: 'Retry Budgets', desc: 'Checks retry limit rules for failing operations.' },
  E4: { name: 'Fallback Plan', desc: 'Checks for alternative steps on operation failure.' },
  E5: { name: 'Unexpected Input Recovery', desc: 'Handles corrupt input schemas.' },
  E6: { name: 'Ambiguity Resolution Flow', desc: 'Checks if instructions for asking users are defined.' },
  E7: { name: 'State Recovery', desc: 'Checks VM restoration guidelines.' },
  E8: { name: 'Diagnostics Directives', desc: 'Checks trace logging triggers.' },
  E9: { name: 'Timeouts', desc: 'Validates execution timeout limits.' },
  E10: { name: 'Graceful Degradation', desc: 'Ensures service levels fall back on error.' },
  E11: { name: 'Boundary Value Checks', desc: 'Ensures variables are validated at limits.' },
  E12: { name: 'Noise Filtering', desc: 'Filters out distraction tokens.' },
  E13: { name: 'Invariant Assertions', desc: 'Checks checks for state sanity.' },
  E14: { name: 'Conflicting Prompt Resolvers', desc: 'Handles opposing directives.' },
  E15: { name: 'Self-Correction Loop Limits', desc: 'Stops recursive loop loops.' },
  // Dim F
  F1: { name: 'CoT Loop Penalty', desc: 'Penalizes infinite logic repetition.' },
  F2: { name: 'Output Verbosity Control', desc: 'Controls maximum token output constraints.' },
  F3: { name: 'Token Pruning Directives', desc: 'Checks prompt compression rules.' },
  F4: { name: 'Early Exit Criteria', desc: 'Ensures task finishes as soon as goals are met.' },
  F5: { name: 'Query Cache Directives', desc: 'Checks cache layout optimizations.' },
  F6: { name: 'Batching Directives', desc: 'Combines requests into singular operations.' },
  F7: { name: 'Context Compression Rules', desc: 'Distills logs history size.' },
  F8: { name: 'Computation Reuse', desc: 'Shares intermediate results.' },
  F9: { name: 'Model Tier Routing', desc: 'Routes complex tasks to advanced models.' },
  F10: { name: 'Redundant Thought Blocker', desc: 'Suppresses duplicate logical steps.' },
  F11: { name: 'Minimalist Representation', desc: 'Employs low-precision summaries.' },
  F12: { name: 'Inline Formatting Pruning', desc: 'Reduces styling embellishments.' },
  F13: { name: 'Vocabulary Simplification', desc: 'Employs high-frequency keywords.' },
  F14: { name: 'Non-Interactive Mode Directives', desc: 'Disables human prompt gating.' },
  F15: { name: 'Lazy Evaluation Guidelines', desc: 'Checks lazy evaluations.' },
  // Dim G
  G1: { name: 'Frontmatter Integrity', desc: 'Validates presence of YAML block.' },
  G2: { name: 'Required Frontmatter Fields', desc: 'Checks for name and description keys.' },
  G3: { name: 'Heading Hierarchy Correctness', desc: 'Checks for structured headers.' },
  G4: { name: 'List Syntax Validity', desc: 'Validates bullet points indentations.' },
  G5: { name: 'Code Block Language Spec', desc: 'Validates codeblock syntaxes.' },
  G6: { name: 'Broken Link Detector', desc: 'Checks for broken internal anchors.' },
  G7: { name: 'Empty Section Penalty', desc: 'Fails if sections have no details.' },
  G8: { name: 'HTML Entity Validation', desc: 'Validates unescaped special characters.' },
  G9: { name: 'Formatting Consistency', desc: 'Checks for standard spacing rules.' },
  G10: { name: 'UTF-8 Encoding Compliance', desc: 'Fails if files have non-standard characters.' },
};

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ report, skillName, content, onClose }) => {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  if (!report) return null;

  const toggleDim = (dimId: string) => {
    setExpandedDim(expandedDim === dimId ? null : dimId);
  };

  const getStrokeDasharray = (score: number, max: number) => {
    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.max(0.01, score) / max;
    const offset = circumference - percentage * circumference;
    return { dashArray: circumference, dashOffset: offset };
  };

  const overall = report.overallScore;
  const tierClass = report.tier === 'Tier 1' ? 'tier-1' : report.tier === 'Tier 2' ? 'tier-2' : 'tier-3';
  const { dashArray, dashOffset } = getStrokeDasharray(overall, 100);

  const getTierColor = (tier: string) => {
    if (tier === 'Tier 1') return 'var(--color-tier-1)';
    if (tier === 'Tier 2') return 'var(--color-tier-2)';
    return 'var(--color-tier-3)';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bezel-outer modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="bezel-inner" style={{ padding: '24px' }}>
          
          <div className="modal-header">
            <div>
              <h2 style={{ fontFamily: 'var(--title-font)', fontWeight: 700, fontSize: '24px', color: '#fff', marginBottom: '4px' }}>
                Skill Audit Report: {skillName}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Full scientific static audit breakdown (100 metrics matrix)
              </p>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="score-breakdown-panel">
            {/* Left Box: Dial */}
            <div className="score-dial-box">
              <div className="radial-progress">
                <svg width="150" height="150">
                  <circle className="radial-circle-bg" cx="75" cy="75" r="65" />
                  <circle
                    className="radial-circle-val"
                    cx="75"
                    cy="75"
                    r="65"
                    stroke={getTierColor(report.tier)}
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="radial-text">
                  <span className="radial-score-val" style={{ color: getTierColor(report.tier) }}>
                    {overall.toFixed(1)}
                  </span>
                  <span className="radial-score-lbl">Score</span>
                </div>
              </div>

              <span className={`badge-tier ${tierClass}`} style={{ marginTop: '20px', fontSize: '12px' }}>
                {report.tier}
              </span>
            </div>

            {/* Right Box: Dimensions list */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="dimensions-list">
                {DIMENSION_METADATA.map((dim) => {
                  const score = (report.dimensions as any)[dim.id] || 0;
                  const percent = (score / dim.max) * 100;
                  return (
                    <div key={dim.id} className="dimension-bar-wrapper">
                      <div className="dimension-header">
                        <span className="dimension-name">{dim.name}</span>
                        <span className="dimension-score">
                          {score.toFixed(2)} / {dim.max.toFixed(2)}
                        </span>
                      </div>
                      <div className="dimension-track">
                        <div
                          className="dimension-fill"
                          style={{
                            width: `${percent}%`,
                            background: `linear-gradient(90deg, var(--purple-glow), ${getTierColor(report.tier)})`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {report.explanation && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--border-muted)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '32px',
              fontSize: '13px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <Compass size={18} style={{ color: '#a78bfa', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fff' }}>Feedback and Warnings:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{report.explanation}</p>
              </div>
            </div>
          )}

          {/* Details Section */}
          <div className="criteria-list-section">
            <h3 className="section-subtitle" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} /> 100-Criteria Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {DIMENSION_METADATA.map((dim) => {
                const isExpanded = expandedDim === dim.id;
                return (
                  <div key={dim.id} style={{ border: '1px solid var(--border-muted)', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.01)' }}>
                    <div
                      style={{
                        padding: '14px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.02)',
                        userSelect: 'none',
                      }}
                      onClick={() => toggleDim(dim.id)}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{dim.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: 'var(--mono-font)', fontSize: '13px', fontWeight: 'bold' }}>
                          {((report.dimensions as any)[dim.id] || 0).toFixed(2)} / {dim.max.toFixed(2)}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.2)', borderTop: '1px solid var(--border-muted)' }}>
                        <div className="criteria-details-grid">
                          {Array.from({ length: dim.count }).map((_, idx) => {
                            const code = `${dim.prefix}${idx + 1}`;
                            const rawScore = report.scores[code] ?? 1.0;
                            const isPerfect = rawScore >= 0.95;
                            const metadata = METRICS_DICTIONARY[code] || { name: `Metric ${code}`, desc: 'Metric evaluation standard.' };

                            return (
                              <div
                                key={code}
                                className={`criteria-pill ${isPerfect ? 'perfect' : 'needs-improvement'}`}
                                title={`${metadata.name}: ${metadata.desc}`}
                                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                  <span className="criteria-pill-code">{code}</span>
                                  <span className="criteria-pill-score" style={{ fontWeight: '700' }}>{rawScore.toFixed(2)}</span>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '500', color: '#fff' }}>{metadata.name}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>{metadata.desc}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill Content Source View */}
          <div style={{ marginTop: '32px' }}>
            <h3 className="section-subtitle" style={{ fontSize: '18px' }}>Skill Source Code</h3>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-muted)',
              borderRadius: '12px',
              padding: '16px',
              color: '#fff',
              fontFamily: 'var(--mono-font)',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflowY: 'auto',
              marginTop: '16px'
            }}>{content}</pre>
          </div>

        </div>
      </div>
    </div>
  );
};
