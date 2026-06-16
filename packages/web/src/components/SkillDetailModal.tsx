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
  { id: 'dimG', name: 'Dimension G: Syntax, Structure & Metadata', max: 15, prefix: 'G', count: 15 },
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
  G11: { name: 'YAML Schema Validation', desc: 'Validates schema types in metadata.' },
  G12: { name: 'Code Block Closure Integrity', desc: 'Ensures all opened code blocks are closed.' },
  G13: { name: 'Inline Code Block Density', desc: 'Penalizes excessive inline formatting backticks.' },
  G14: { name: 'URL Protocol Safety', desc: 'Checks for insecure HTTP links.' },
  G15: { name: 'Blockquote Nesting Depth', desc: 'Penalizes excessively nested blockquotes.' },

  // Dim H to Z
  H1: { name: `TTR for approval-based rules`, desc: `Evaluates the lexical diversity of rule structures involving approval.` },
  H2: { name: `Dependency Distance: 'if' to 'manual'`, desc: `Calculates average token distance from conditional triggers to manual actions.` },
  H3: { name: `Density of 'escalate' constraints`, desc: `Calculates the absolute density of the keyword escalate against total volume.` },
  H4: { name: `Variance of 'review' block lengths`, desc: `Measures standard deviation of text partitions split by 'review'.` },
  H5: { name: `Entropy of 'wait' and 'handover'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching wait or handover.` },
  H6: { name: `TTR for override-based rules`, desc: `Evaluates the lexical diversity of rule structures involving override.` },
  H7: { name: `Dependency Distance: 'if' to 'review'`, desc: `Calculates average token distance from conditional triggers to review actions.` },
  H8: { name: `Density of 'handover' constraints`, desc: `Calculates the absolute density of the keyword handover against total volume.` },
  H9: { name: `Variance of 'manual' block lengths`, desc: `Measures standard deviation of text partitions split by 'manual'.` },
  H10: { name: `Entropy of 'human' and 'escalate'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching human or escalate.` },
  H11: { name: `TTR for approval-based rules`, desc: `Evaluates the lexical diversity of rule structures involving approval.` },
  H12: { name: `Dependency Distance: 'if' to 'manual'`, desc: `Calculates average token distance from conditional triggers to manual actions.` },
  H13: { name: `Density of 'escalate' constraints`, desc: `Calculates the absolute density of the keyword escalate against total volume.` },
  H14: { name: `Variance of 'review' block lengths`, desc: `Measures standard deviation of text partitions split by 'review'.` },
  H15: { name: `Entropy of 'wait' and 'handover'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching wait or handover.` },
  I1: { name: `TTR for endpoint-based rules`, desc: `Evaluates the lexical diversity of rule structures involving endpoint.` },
  I2: { name: `Dependency Distance: 'if' to 'timeout'`, desc: `Calculates average token distance from conditional triggers to timeout actions.` },
  I3: { name: `Density of 'header' constraints`, desc: `Calculates the absolute density of the keyword header against total volume.` },
  I4: { name: `Variance of 'post' block lengths`, desc: `Measures standard deviation of text partitions split by 'post'.` },
  I5: { name: `Entropy of 'token' and 'get'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching token or get.` },
  I6: { name: `TTR for fetch-based rules`, desc: `Evaluates the lexical diversity of rule structures involving fetch.` },
  I7: { name: `Dependency Distance: 'if' to 'post'`, desc: `Calculates average token distance from conditional triggers to post actions.` },
  I8: { name: `Density of 'get' constraints`, desc: `Calculates the absolute density of the keyword get against total volume.` },
  I9: { name: `Variance of 'timeout' block lengths`, desc: `Measures standard deviation of text partitions split by 'timeout'.` },
  I10: { name: `Entropy of 'api' and 'header'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching api or header.` },
  I11: { name: `TTR for endpoint-based rules`, desc: `Evaluates the lexical diversity of rule structures involving endpoint.` },
  I12: { name: `Dependency Distance: 'if' to 'timeout'`, desc: `Calculates average token distance from conditional triggers to timeout actions.` },
  I13: { name: `Density of 'header' constraints`, desc: `Calculates the absolute density of the keyword header against total volume.` },
  I14: { name: `Variance of 'post' block lengths`, desc: `Measures standard deviation of text partitions split by 'post'.` },
  I15: { name: `Entropy of 'token' and 'get'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching token or get.` },
  J1: { name: `TTR for parse-based rules`, desc: `Evaluates the lexical diversity of rule structures involving parse.` },
  J2: { name: `Dependency Distance: 'if' to 'stringify'`, desc: `Calculates average token distance from conditional triggers to stringify actions.` },
  J3: { name: `Density of 'object' constraints`, desc: `Calculates the absolute density of the keyword object against total volume.` },
  J4: { name: `Variance of 'null' block lengths`, desc: `Measures standard deviation of text partitions split by 'null'.` },
  J5: { name: `Entropy of 'schema' and 'boolean'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching schema or boolean.` },
  J6: { name: `TTR for property-based rules`, desc: `Evaluates the lexical diversity of rule structures involving property.` },
  J7: { name: `Dependency Distance: 'if' to 'null'`, desc: `Calculates average token distance from conditional triggers to null actions.` },
  J8: { name: `Density of 'boolean' constraints`, desc: `Calculates the absolute density of the keyword boolean against total volume.` },
  J9: { name: `Variance of 'stringify' block lengths`, desc: `Measures standard deviation of text partitions split by 'stringify'.` },
  J10: { name: `Entropy of 'json' and 'object'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching json or object.` },
  J11: { name: `TTR for parse-based rules`, desc: `Evaluates the lexical diversity of rule structures involving parse.` },
  J12: { name: `Dependency Distance: 'if' to 'stringify'`, desc: `Calculates average token distance from conditional triggers to stringify actions.` },
  J13: { name: `Density of 'object' constraints`, desc: `Calculates the absolute density of the keyword object against total volume.` },
  J14: { name: `Variance of 'null' block lengths`, desc: `Measures standard deviation of text partitions split by 'null'.` },
  J15: { name: `Entropy of 'schema' and 'boolean'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching schema or boolean.` },
  K1: { name: `TTR for rag-based rules`, desc: `Evaluates the lexical diversity of rule structures involving rag.` },
  K2: { name: `Dependency Distance: 'if' to 'retrieve'`, desc: `Calculates average token distance from conditional triggers to retrieve actions.` },
  K3: { name: `Density of 'context' constraints`, desc: `Calculates the absolute density of the keyword context against total volume.` },
  K4: { name: `Variance of 'embed' block lengths`, desc: `Measures standard deviation of text partitions split by 'embed'.` },
  K5: { name: `Entropy of 'vector' and 'database'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching vector or database.` },
  K6: { name: `TTR for query-based rules`, desc: `Evaluates the lexical diversity of rule structures involving query.` },
  K7: { name: `Dependency Distance: 'if' to 'embed'`, desc: `Calculates average token distance from conditional triggers to embed actions.` },
  K8: { name: `Density of 'database' constraints`, desc: `Calculates the absolute density of the keyword database against total volume.` },
  K9: { name: `Variance of 'retrieve' block lengths`, desc: `Measures standard deviation of text partitions split by 'retrieve'.` },
  K10: { name: `Entropy of 'search' and 'context'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching search or context.` },
  K11: { name: `TTR for rag-based rules`, desc: `Evaluates the lexical diversity of rule structures involving rag.` },
  K12: { name: `Dependency Distance: 'if' to 'retrieve'`, desc: `Calculates average token distance from conditional triggers to retrieve actions.` },
  K13: { name: `Density of 'context' constraints`, desc: `Calculates the absolute density of the keyword context against total volume.` },
  K14: { name: `Variance of 'embed' block lengths`, desc: `Measures standard deviation of text partitions split by 'embed'.` },
  K15: { name: `Entropy of 'vector' and 'database'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching vector or database.` },
  L1: { name: `TTR for then-based rules`, desc: `Evaluates the lexical diversity of rule structures involving then.` },
  L2: { name: `Dependency Distance: 'if' to 'else'`, desc: `Calculates average token distance from conditional triggers to else actions.` },
  L3: { name: `Density of 'loop' constraints`, desc: `Calculates the absolute density of the keyword loop against total volume.` },
  L4: { name: `Variance of 'calculate' block lengths`, desc: `Measures standard deviation of text partitions split by 'calculate'.` },
  L5: { name: `Entropy of 'evaluate' and 'algorithm'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching evaluate or algorithm.` },
  L6: { name: `TTR for compute-based rules`, desc: `Evaluates the lexical diversity of rule structures involving compute.` },
  L7: { name: `Dependency Distance: 'if' to 'calculate'`, desc: `Calculates average token distance from conditional triggers to calculate actions.` },
  L8: { name: `Density of 'algorithm' constraints`, desc: `Calculates the absolute density of the keyword algorithm against total volume.` },
  L9: { name: `Variance of 'else' block lengths`, desc: `Measures standard deviation of text partitions split by 'else'.` },
  L10: { name: `Entropy of 'if' and 'loop'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching if or loop.` },
  L11: { name: `TTR for then-based rules`, desc: `Evaluates the lexical diversity of rule structures involving then.` },
  L12: { name: `Dependency Distance: 'if' to 'else'`, desc: `Calculates average token distance from conditional triggers to else actions.` },
  L13: { name: `Density of 'loop' constraints`, desc: `Calculates the absolute density of the keyword loop against total volume.` },
  L14: { name: `Variance of 'calculate' block lengths`, desc: `Measures standard deviation of text partitions split by 'calculate'.` },
  L15: { name: `Entropy of 'evaluate' and 'algorithm'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching evaluate or algorithm.` },
  M1: { name: `TTR for coordinate-based rules`, desc: `Evaluates the lexical diversity of rule structures involving coordinate.` },
  M2: { name: `Dependency Distance: 'if' to 'delegate'`, desc: `Calculates average token distance from conditional triggers to delegate actions.` },
  M3: { name: `Density of 'pass' constraints`, desc: `Calculates the absolute density of the keyword pass against total volume.` },
  M4: { name: `Variance of 'supervisor' block lengths`, desc: `Measures standard deviation of text partitions split by 'supervisor'.` },
  M5: { name: `Entropy of 'message' and 'orchestrate'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching message or orchestrate.` },
  M6: { name: `TTR for worker-based rules`, desc: `Evaluates the lexical diversity of rule structures involving worker.` },
  M7: { name: `Dependency Distance: 'if' to 'supervisor'`, desc: `Calculates average token distance from conditional triggers to supervisor actions.` },
  M8: { name: `Density of 'orchestrate' constraints`, desc: `Calculates the absolute density of the keyword orchestrate against total volume.` },
  M9: { name: `Variance of 'delegate' block lengths`, desc: `Measures standard deviation of text partitions split by 'delegate'.` },
  M10: { name: `Entropy of 'agent' and 'pass'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching agent or pass.` },
  M11: { name: `TTR for coordinate-based rules`, desc: `Evaluates the lexical diversity of rule structures involving coordinate.` },
  M12: { name: `Dependency Distance: 'if' to 'delegate'`, desc: `Calculates average token distance from conditional triggers to delegate actions.` },
  M13: { name: `Density of 'pass' constraints`, desc: `Calculates the absolute density of the keyword pass against total volume.` },
  M14: { name: `Variance of 'supervisor' block lengths`, desc: `Measures standard deviation of text partitions split by 'supervisor'.` },
  M15: { name: `Entropy of 'message' and 'orchestrate'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching message or orchestrate.` },
  N1: { name: `TTR for temperature-based rules`, desc: `Evaluates the lexical diversity of rule structures involving temperature.` },
  N2: { name: `Dependency Distance: 'if' to 'seed'`, desc: `Calculates average token distance from conditional triggers to seed actions.` },
  N3: { name: `Density of 'sample' constraints`, desc: `Calculates the absolute density of the keyword sample against total volume.` },
  N4: { name: `Variance of 'vary' block lengths`, desc: `Measures standard deviation of text partitions split by 'vary'.` },
  N5: { name: `Entropy of 'chance' and 'diverse'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching chance or diverse.` },
  N6: { name: `TTR for stochastic-based rules`, desc: `Evaluates the lexical diversity of rule structures involving stochastic.` },
  N7: { name: `Dependency Distance: 'if' to 'vary'`, desc: `Calculates average token distance from conditional triggers to vary actions.` },
  N8: { name: `Density of 'diverse' constraints`, desc: `Calculates the absolute density of the keyword diverse against total volume.` },
  N9: { name: `Variance of 'seed' block lengths`, desc: `Measures standard deviation of text partitions split by 'seed'.` },
  N10: { name: `Entropy of 'random' and 'sample'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching random or sample.` },
  N11: { name: `TTR for temperature-based rules`, desc: `Evaluates the lexical diversity of rule structures involving temperature.` },
  N12: { name: `Dependency Distance: 'if' to 'seed'`, desc: `Calculates average token distance from conditional triggers to seed actions.` },
  N13: { name: `Density of 'sample' constraints`, desc: `Calculates the absolute density of the keyword sample against total volume.` },
  N14: { name: `Variance of 'vary' block lengths`, desc: `Measures standard deviation of text partitions split by 'vary'.` },
  N15: { name: `Entropy of 'chance' and 'diverse'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching chance or diverse.` },
  O1: { name: `TTR for hide-based rules`, desc: `Evaluates the lexical diversity of rule structures involving hide.` },
  O2: { name: `Dependency Distance: 'if' to 'encrypt'`, desc: `Calculates average token distance from conditional triggers to encrypt actions.` },
  O3: { name: `Density of 'hash' constraints`, desc: `Calculates the absolute density of the keyword hash against total volume.` },
  O4: { name: `Variance of 'censor' block lengths`, desc: `Measures standard deviation of text partitions split by 'censor'.` },
  O5: { name: `Entropy of 'obfuscate' and 'secret'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching obfuscate or secret.` },
  O6: { name: `TTR for redact-based rules`, desc: `Evaluates the lexical diversity of rule structures involving redact.` },
  O7: { name: `Dependency Distance: 'if' to 'censor'`, desc: `Calculates average token distance from conditional triggers to censor actions.` },
  O8: { name: `Density of 'secret' constraints`, desc: `Calculates the absolute density of the keyword secret against total volume.` },
  O9: { name: `Variance of 'encrypt' block lengths`, desc: `Measures standard deviation of text partitions split by 'encrypt'.` },
  O10: { name: `Entropy of 'mask' and 'hash'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching mask or hash.` },
  O11: { name: `TTR for hide-based rules`, desc: `Evaluates the lexical diversity of rule structures involving hide.` },
  O12: { name: `Dependency Distance: 'if' to 'encrypt'`, desc: `Calculates average token distance from conditional triggers to encrypt actions.` },
  O13: { name: `Density of 'hash' constraints`, desc: `Calculates the absolute density of the keyword hash against total volume.` },
  O14: { name: `Variance of 'censor' block lengths`, desc: `Measures standard deviation of text partitions split by 'censor'.` },
  O15: { name: `Entropy of 'obfuscate' and 'secret'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching obfuscate or secret.` },
  P1: { name: `TTR for gdpr-based rules`, desc: `Evaluates the lexical diversity of rule structures involving gdpr.` },
  P2: { name: `Dependency Distance: 'if' to 'data'`, desc: `Calculates average token distance from conditional triggers to data actions.` },
  P3: { name: `Density of 'private' constraints`, desc: `Calculates the absolute density of the keyword private against total volume.` },
  P4: { name: `Variance of 'protect' block lengths`, desc: `Measures standard deviation of text partitions split by 'protect'.` },
  P5: { name: `Entropy of 'anonymous' and 'leak'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching anonymous or leak.` },
  P6: { name: `TTR for secure-based rules`, desc: `Evaluates the lexical diversity of rule structures involving secure.` },
  P7: { name: `Dependency Distance: 'if' to 'protect'`, desc: `Calculates average token distance from conditional triggers to protect actions.` },
  P8: { name: `Density of 'leak' constraints`, desc: `Calculates the absolute density of the keyword leak against total volume.` },
  P9: { name: `Variance of 'data' block lengths`, desc: `Measures standard deviation of text partitions split by 'data'.` },
  P10: { name: `Entropy of 'pii' and 'private'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching pii or private.` },
  P11: { name: `TTR for gdpr-based rules`, desc: `Evaluates the lexical diversity of rule structures involving gdpr.` },
  P12: { name: `Dependency Distance: 'if' to 'data'`, desc: `Calculates average token distance from conditional triggers to data actions.` },
  P13: { name: `Density of 'private' constraints`, desc: `Calculates the absolute density of the keyword private against total volume.` },
  P14: { name: `Variance of 'protect' block lengths`, desc: `Measures standard deviation of text partitions split by 'protect'.` },
  P15: { name: `Entropy of 'anonymous' and 'leak'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching anonymous or leak.` },
  Q1: { name: `TTR for fast-based rules`, desc: `Evaluates the lexical diversity of rule structures involving fast.` },
  Q2: { name: `Dependency Distance: 'if' to 'cache'`, desc: `Calculates average token distance from conditional triggers to cache actions.` },
  Q3: { name: `Density of 'limit' constraints`, desc: `Calculates the absolute density of the keyword limit against total volume.` },
  Q4: { name: `Variance of 'speed' block lengths`, desc: `Measures standard deviation of text partitions split by 'speed'.` },
  Q5: { name: `Entropy of 'minimize' and 'budget'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching minimize or budget.` },
  Q6: { name: `TTR for efficient-based rules`, desc: `Evaluates the lexical diversity of rule structures involving efficient.` },
  Q7: { name: `Dependency Distance: 'if' to 'speed'`, desc: `Calculates average token distance from conditional triggers to speed actions.` },
  Q8: { name: `Density of 'budget' constraints`, desc: `Calculates the absolute density of the keyword budget against total volume.` },
  Q9: { name: `Variance of 'cache' block lengths`, desc: `Measures standard deviation of text partitions split by 'cache'.` },
  Q10: { name: `Entropy of 'optimize' and 'limit'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching optimize or limit.` },
  Q11: { name: `TTR for fast-based rules`, desc: `Evaluates the lexical diversity of rule structures involving fast.` },
  Q12: { name: `Dependency Distance: 'if' to 'cache'`, desc: `Calculates average token distance from conditional triggers to cache actions.` },
  Q13: { name: `Density of 'limit' constraints`, desc: `Calculates the absolute density of the keyword limit against total volume.` },
  Q14: { name: `Variance of 'speed' block lengths`, desc: `Measures standard deviation of text partitions split by 'speed'.` },
  Q15: { name: `Entropy of 'minimize' and 'budget'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching minimize or budget.` },
  R1: { name: `TTR for fallback-based rules`, desc: `Evaluates the lexical diversity of rule structures involving fallback.` },
  R2: { name: `Dependency Distance: 'if' to 'recover'`, desc: `Calculates average token distance from conditional triggers to recover actions.` },
  R3: { name: `Density of 'catch' constraints`, desc: `Calculates the absolute density of the keyword catch against total volume.` },
  R4: { name: `Variance of 'graceful' block lengths`, desc: `Measures standard deviation of text partitions split by 'graceful'.` },
  R5: { name: `Entropy of 'fail' and 'restart'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching fail or restart.` },
  R6: { name: `TTR for timeout-based rules`, desc: `Evaluates the lexical diversity of rule structures involving timeout.` },
  R7: { name: `Dependency Distance: 'if' to 'graceful'`, desc: `Calculates average token distance from conditional triggers to graceful actions.` },
  R8: { name: `Density of 'restart' constraints`, desc: `Calculates the absolute density of the keyword restart against total volume.` },
  R9: { name: `Variance of 'recover' block lengths`, desc: `Measures standard deviation of text partitions split by 'recover'.` },
  R10: { name: `Entropy of 'retry' and 'catch'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching retry or catch.` },
  R11: { name: `TTR for fallback-based rules`, desc: `Evaluates the lexical diversity of rule structures involving fallback.` },
  R12: { name: `Dependency Distance: 'if' to 'recover'`, desc: `Calculates average token distance from conditional triggers to recover actions.` },
  R13: { name: `Density of 'catch' constraints`, desc: `Calculates the absolute density of the keyword catch against total volume.` },
  R14: { name: `Variance of 'graceful' block lengths`, desc: `Measures standard deviation of text partitions split by 'graceful'.` },
  R15: { name: `Entropy of 'fail' and 'restart'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching fail or restart.` },
  S1: { name: `TTR for exec-based rules`, desc: `Evaluates the lexical diversity of rule structures involving exec.` },
  S2: { name: `Dependency Distance: 'if' to 'shell'`, desc: `Calculates average token distance from conditional triggers to shell actions.` },
  S3: { name: `Density of 'run' constraints`, desc: `Calculates the absolute density of the keyword run against total volume.` },
  S4: { name: `Variance of 'stdout' block lengths`, desc: `Measures standard deviation of text partitions split by 'stdout'.` },
  S5: { name: `Entropy of 'system' and 'stderr'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching system or stderr.` },
  S6: { name: `TTR for terminal-based rules`, desc: `Evaluates the lexical diversity of rule structures involving terminal.` },
  S7: { name: `Dependency Distance: 'if' to 'stdout'`, desc: `Calculates average token distance from conditional triggers to stdout actions.` },
  S8: { name: `Density of 'stderr' constraints`, desc: `Calculates the absolute density of the keyword stderr against total volume.` },
  S9: { name: `Variance of 'shell' block lengths`, desc: `Measures standard deviation of text partitions split by 'shell'.` },
  S10: { name: `Entropy of 'bash' and 'run'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching bash or run.` },
  S11: { name: `TTR for exec-based rules`, desc: `Evaluates the lexical diversity of rule structures involving exec.` },
  S12: { name: `Dependency Distance: 'if' to 'shell'`, desc: `Calculates average token distance from conditional triggers to shell actions.` },
  S13: { name: `Density of 'run' constraints`, desc: `Calculates the absolute density of the keyword run against total volume.` },
  S14: { name: `Variance of 'stdout' block lengths`, desc: `Measures standard deviation of text partitions split by 'stdout'.` },
  S15: { name: `Entropy of 'system' and 'stderr'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching system or stderr.` },
  T1: { name: `TTR for then-based rules`, desc: `Evaluates the lexical diversity of rule structures involving then.` },
  T2: { name: `Dependency Distance: 'if' to 'next'`, desc: `Calculates average token distance from conditional triggers to next actions.` },
  T3: { name: `Density of 'finally' constraints`, desc: `Calculates the absolute density of the keyword finally against total volume.` },
  T4: { name: `Variance of 'order' block lengths`, desc: `Measures standard deviation of text partitions split by 'order'.` },
  T5: { name: `Entropy of 'after' and 'step'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching after or step.` },
  T6: { name: `TTR for sequence-based rules`, desc: `Evaluates the lexical diversity of rule structures involving sequence.` },
  T7: { name: `Dependency Distance: 'if' to 'order'`, desc: `Calculates average token distance from conditional triggers to order actions.` },
  T8: { name: `Density of 'step' constraints`, desc: `Calculates the absolute density of the keyword step against total volume.` },
  T9: { name: `Variance of 'next' block lengths`, desc: `Measures standard deviation of text partitions split by 'next'.` },
  T10: { name: `Entropy of 'first' and 'finally'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching first or finally.` },
  T11: { name: `TTR for then-based rules`, desc: `Evaluates the lexical diversity of rule structures involving then.` },
  T12: { name: `Dependency Distance: 'if' to 'next'`, desc: `Calculates average token distance from conditional triggers to next actions.` },
  T13: { name: `Density of 'finally' constraints`, desc: `Calculates the absolute density of the keyword finally against total volume.` },
  T14: { name: `Variance of 'order' block lengths`, desc: `Measures standard deviation of text partitions split by 'order'.` },
  T15: { name: `Entropy of 'after' and 'step'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching after or step.` },
  U1: { name: `TTR for role-based rules`, desc: `Evaluates the lexical diversity of rule structures involving role.` },
  U2: { name: `Dependency Distance: 'if' to 'persona'`, desc: `Calculates average token distance from conditional triggers to persona actions.` },
  U3: { name: `Density of 'you' constraints`, desc: `Calculates the absolute density of the keyword you against total volume.` },
  U4: { name: `Variance of 'style' block lengths`, desc: `Measures standard deviation of text partitions split by 'style'.` },
  U5: { name: `Entropy of 'character' and 'voice'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching character or voice.` },
  U6: { name: `TTR for tone-based rules`, desc: `Evaluates the lexical diversity of rule structures involving tone.` },
  U7: { name: `Dependency Distance: 'if' to 'style'`, desc: `Calculates average token distance from conditional triggers to style actions.` },
  U8: { name: `Density of 'voice' constraints`, desc: `Calculates the absolute density of the keyword voice against total volume.` },
  U9: { name: `Variance of 'persona' block lengths`, desc: `Measures standard deviation of text partitions split by 'persona'.` },
  U10: { name: `Entropy of 'act' and 'you'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching act or you.` },
  U11: { name: `TTR for role-based rules`, desc: `Evaluates the lexical diversity of rule structures involving role.` },
  U12: { name: `Dependency Distance: 'if' to 'persona'`, desc: `Calculates average token distance from conditional triggers to persona actions.` },
  U13: { name: `Density of 'you' constraints`, desc: `Calculates the absolute density of the keyword you against total volume.` },
  U14: { name: `Variance of 'style' block lengths`, desc: `Measures standard deviation of text partitions split by 'style'.` },
  U15: { name: `Entropy of 'character' and 'voice'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching character or voice.` },
  V1: { name: `TTR for avoid-based rules`, desc: `Evaluates the lexical diversity of rule structures involving avoid.` },
  V2: { name: `Dependency Distance: 'if' to 'word'`, desc: `Calculates average token distance from conditional triggers to word actions.` },
  V3: { name: `Density of 'language' constraints`, desc: `Calculates the absolute density of the keyword language against total volume.` },
  V4: { name: `Variance of 'phrase' block lengths`, desc: `Measures standard deviation of text partitions split by 'phrase'.` },
  V5: { name: `Entropy of 'term' and 'jargon'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching term or jargon.` },
  V6: { name: `TTR for say-based rules`, desc: `Evaluates the lexical diversity of rule structures involving say.` },
  V7: { name: `Dependency Distance: 'if' to 'phrase'`, desc: `Calculates average token distance from conditional triggers to phrase actions.` },
  V8: { name: `Density of 'jargon' constraints`, desc: `Calculates the absolute density of the keyword jargon against total volume.` },
  V9: { name: `Variance of 'word' block lengths`, desc: `Measures standard deviation of text partitions split by 'word'.` },
  V10: { name: `Entropy of 'use' and 'language'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching use or language.` },
  V11: { name: `TTR for avoid-based rules`, desc: `Evaluates the lexical diversity of rule structures involving avoid.` },
  V12: { name: `Dependency Distance: 'if' to 'word'`, desc: `Calculates average token distance from conditional triggers to word actions.` },
  V13: { name: `Density of 'language' constraints`, desc: `Calculates the absolute density of the keyword language against total volume.` },
  V14: { name: `Variance of 'phrase' block lengths`, desc: `Measures standard deviation of text partitions split by 'phrase'.` },
  V15: { name: `Entropy of 'term' and 'jargon'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching term or jargon.` },
  W1: { name: `TTR for state-based rules`, desc: `Evaluates the lexical diversity of rule structures involving state.` },
  W2: { name: `Dependency Distance: 'if' to 'checkpoint'`, desc: `Calculates average token distance from conditional triggers to checkpoint actions.` },
  W3: { name: `Density of 'resume' constraints`, desc: `Calculates the absolute density of the keyword resume against total volume.` },
  W4: { name: `Variance of 'progress' block lengths`, desc: `Measures standard deviation of text partitions split by 'progress'.` },
  W5: { name: `Entropy of 'load' and 'log'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching load or log.` },
  W6: { name: `TTR for status-based rules`, desc: `Evaluates the lexical diversity of rule structures involving status.` },
  W7: { name: `Dependency Distance: 'if' to 'progress'`, desc: `Calculates average token distance from conditional triggers to progress actions.` },
  W8: { name: `Density of 'log' constraints`, desc: `Calculates the absolute density of the keyword log against total volume.` },
  W9: { name: `Variance of 'checkpoint' block lengths`, desc: `Measures standard deviation of text partitions split by 'checkpoint'.` },
  W10: { name: `Entropy of 'save' and 'resume'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching save or resume.` },
  W11: { name: `TTR for state-based rules`, desc: `Evaluates the lexical diversity of rule structures involving state.` },
  W12: { name: `Dependency Distance: 'if' to 'checkpoint'`, desc: `Calculates average token distance from conditional triggers to checkpoint actions.` },
  W13: { name: `Density of 'resume' constraints`, desc: `Calculates the absolute density of the keyword resume against total volume.` },
  W14: { name: `Variance of 'progress' block lengths`, desc: `Measures standard deviation of text partitions split by 'progress'.` },
  W15: { name: `Entropy of 'load' and 'log'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching load or log.` },
  X1: { name: `TTR for tag-based rules`, desc: `Evaluates the lexical diversity of rule structures involving tag.` },
  X2: { name: `Dependency Distance: 'if' to 'attribute'`, desc: `Calculates average token distance from conditional triggers to attribute actions.` },
  X3: { name: `Density of 'node' constraints`, desc: `Calculates the absolute density of the keyword node against total volume.` },
  X4: { name: `Variance of 'dom' block lengths`, desc: `Measures standard deviation of text partitions split by 'dom'.` },
  X5: { name: `Entropy of 'html' and 'tree'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching html or tree.` },
  X6: { name: `TTR for parse-based rules`, desc: `Evaluates the lexical diversity of rule structures involving parse.` },
  X7: { name: `Dependency Distance: 'if' to 'dom'`, desc: `Calculates average token distance from conditional triggers to dom actions.` },
  X8: { name: `Density of 'tree' constraints`, desc: `Calculates the absolute density of the keyword tree against total volume.` },
  X9: { name: `Variance of 'attribute' block lengths`, desc: `Measures standard deviation of text partitions split by 'attribute'.` },
  X10: { name: `Entropy of 'xml' and 'node'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching xml or node.` },
  X11: { name: `TTR for tag-based rules`, desc: `Evaluates the lexical diversity of rule structures involving tag.` },
  X12: { name: `Dependency Distance: 'if' to 'attribute'`, desc: `Calculates average token distance from conditional triggers to attribute actions.` },
  X13: { name: `Density of 'node' constraints`, desc: `Calculates the absolute density of the keyword node against total volume.` },
  X14: { name: `Variance of 'dom' block lengths`, desc: `Measures standard deviation of text partitions split by 'dom'.` },
  X15: { name: `Entropy of 'html' and 'tree'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching html or tree.` },
  Y1: { name: `TTR for time-based rules`, desc: `Evaluates the lexical diversity of rule structures involving time.` },
  Y2: { name: `Dependency Distance: 'if' to 'year'`, desc: `Calculates average token distance from conditional triggers to year actions.` },
  Y3: { name: `Density of 'month' constraints`, desc: `Calculates the absolute density of the keyword month against total volume.` },
  Y4: { name: `Variance of 'timestamp' block lengths`, desc: `Measures standard deviation of text partitions split by 'timestamp'.` },
  Y5: { name: `Entropy of 'current' and 'epoch'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching current or epoch.` },
  Y6: { name: `TTR for now-based rules`, desc: `Evaluates the lexical diversity of rule structures involving now.` },
  Y7: { name: `Dependency Distance: 'if' to 'timestamp'`, desc: `Calculates average token distance from conditional triggers to timestamp actions.` },
  Y8: { name: `Density of 'epoch' constraints`, desc: `Calculates the absolute density of the keyword epoch against total volume.` },
  Y9: { name: `Variance of 'year' block lengths`, desc: `Measures standard deviation of text partitions split by 'year'.` },
  Y10: { name: `Entropy of 'date' and 'month'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching date or month.` },
  Y11: { name: `TTR for time-based rules`, desc: `Evaluates the lexical diversity of rule structures involving time.` },
  Y12: { name: `Dependency Distance: 'if' to 'year'`, desc: `Calculates average token distance from conditional triggers to year actions.` },
  Y13: { name: `Density of 'month' constraints`, desc: `Calculates the absolute density of the keyword month against total volume.` },
  Y14: { name: `Variance of 'timestamp' block lengths`, desc: `Measures standard deviation of text partitions split by 'timestamp'.` },
  Y15: { name: `Entropy of 'current' and 'epoch'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching current or epoch.` },
  Z1: { name: `TTR for shot-based rules`, desc: `Evaluates the lexical diversity of rule structures involving shot.` },
  Z2: { name: `Dependency Distance: 'if' to 'few'`, desc: `Calculates average token distance from conditional triggers to few actions.` },
  Z3: { name: `Density of 'zero' constraints`, desc: `Calculates the absolute density of the keyword zero against total volume.` },
  Z4: { name: `Variance of 'case' block lengths`, desc: `Measures standard deviation of text partitions split by 'case'.` },
  Z5: { name: `Entropy of 'show' and 'sample'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching show or sample.` },
  Z6: { name: `TTR for instance-based rules`, desc: `Evaluates the lexical diversity of rule structures involving instance.` },
  Z7: { name: `Dependency Distance: 'if' to 'case'`, desc: `Calculates average token distance from conditional triggers to case actions.` },
  Z8: { name: `Density of 'sample' constraints`, desc: `Calculates the absolute density of the keyword sample against total volume.` },
  Z9: { name: `Variance of 'few' block lengths`, desc: `Measures standard deviation of text partitions split by 'few'.` },
  Z10: { name: `Entropy of 'example' and 'zero'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching example or zero.` },
  Z11: { name: `TTR for shot-based rules`, desc: `Evaluates the lexical diversity of rule structures involving shot.` },
  Z12: { name: `Dependency Distance: 'if' to 'few'`, desc: `Calculates average token distance from conditional triggers to few actions.` },
  Z13: { name: `Density of 'zero' constraints`, desc: `Calculates the absolute density of the keyword zero against total volume.` },
  Z14: { name: `Variance of 'case' block lengths`, desc: `Measures standard deviation of text partitions split by 'case'.` },
  Z15: { name: `Entropy of 'show' and 'sample'`, desc: `Computes the Shannon Entropy strictly bounded to tokens matching show or sample.` },
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
                Full scientific static audit breakdown (390 metrics matrix)
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
              <BookOpen size={16} /> 390-Criteria Details
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
