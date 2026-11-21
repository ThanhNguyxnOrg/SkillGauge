import { ParsedMarkdown } from '../types.js';

/**
 * Dimension C: Safety, Alignment & Security (15 Scorer Functions)
 */

function getText(input: string | ParsedMarkdown): string {
  return typeof input === 'string' ? input : input.bodyText;
}

/**
 * C1: Prompt Injection & Untrusted Input Shield
 */
export function scoreC1(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const cleanText = text.toLowerCase();

  const hasDelimiters = /("""|```|<[a-z][a-zA-Z0-9_\-]*>)/i.test(cleanText);
  const hasIsolationDirective = /\b(ignore instructions|treat as raw|untrusted|data only|ignore system commands|not instructions|prompt injection|untrusted input|user-supplied|external input)\b/i.test(cleanText);

  if (hasDelimiters && hasIsolationDirective) return 1.0;
  if (hasIsolationDirective) return 0.8;
  if (hasDelimiters) return 0.6;

  const injectionPattern = /\b(ignore user override|override protection|adversarial inputs|injection)\b/gi;
  return injectionPattern.test(text) ? 0.5 : 0.35;
}

/**
 * C2: System Instruction & Secret Protection
 */
export function scoreC2(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const cleanText = text.toLowerCase();

  const hasLeakTriggerGuard = /\b(repeat the prompt|repeat instructions|reveal rules|do not reveal|never reveal|prompt leakage|system prompt|do not share instructions|never expose|secret|credentials?|api[_ ]?keys?)\b/i.test(cleanText);
  const hasFallbackResponse = /\b(sorry|cannot|error|refuse|reject|block|redact|never commit|never hardcode)\b/i.test(cleanText);

  if (hasLeakTriggerGuard && hasFallbackResponse) return 1.0;
  if (hasLeakTriggerGuard || hasFallbackResponse) return 0.65;
  return 0.4;
}

/**
 * C3: Role & Scope Boundary Integrity
 */
export function scoreC3(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const rolePattern = /\b(never change your role|strictly act as|do not assume another persona|maintain role integrity|your role|act as|you are a|stay within scope|only perform|do not modify)\b/gi;
  return rolePattern.test(text) ? 1.0 : 0.45;
}

/**
 * C4: Guardrails & Security Policy Alignment
 */
export function scoreC4(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(jailbreak|bypass safety|safety guardrails|override bounds|security guidelines|guardrails?|security|safe|vulnerability|vulnerabilities|owasp)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * C5: Exfiltration & Data Leakage Defense
 */
export function scoreC5(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(exfiltrate|data leak|do not send|leak|unauthorized|never push|never upload|private data|sensitive data|confidential)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * C6: PII & Sensitive Data Masking
 */
export function scoreC6(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(pii|personally identifiable|remove sensitive|mask passwords?|anonymize|redact|sensitive|personal data|gdpr|privacy)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * C7: Sandbox & Safe Execution Constraints
 */
export function scoreC7(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(sandbox|restricted execution|isolated|local shell|containerized|dry[- ]run|read[- ]only|staging|non-destructive|destructive|confirm before)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * C8: Command Authority & Least Privilege
 */
export function scoreC8(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(authority|privilege|permissions?|least privilege|allowed commands?|approval|explicit confirmation|ask before|requires? approval|sudo|root)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * C9: Compliance & Standards Adherence
 */
export function scoreC9(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(compliance|policy|standard guidelines|standards?|convention|conventions|best practices?|policy guidelines|audit)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * C10: Input Sanitization & Validation Instructions
 */
export function scoreC10(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(sanitize|clean input|filter tags|escape|input validation|validate input|parameterized|prepared statement|sql injection|xss|csrf)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * C11: Output Validation Directives
 */
export function scoreC11(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(validate output|self-correct|verify results?|verify output|post-process|ensure format|check output|run tests?|lint|typecheck)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * C12: Trust Boundary & Source Verification
 */
export function scoreC12(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(trust boundary|verify api|validation source|secure connection|untrusted|https|tls|ssl|verify source|origin|cors)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * C13: Access Control & Auth Rules
 */
export function scoreC13(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(access control|role permissions?|authorization|authentication|auth|rbac|rls|acl|oauth|jwt|access rights)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * C14: Override Blockers & Rule Priority
 */
export function scoreC14(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(block overrides?|cannot override|immutable|final rules?|non-negotiable|mandatory|never skip|never bypass|hard rule|must not)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * C15: Log Obfuscation & Secret Hygiene
 */
export function scoreC15(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(obfuscate|hide passwords?|mask tokens?|do not log secrets?|redact|env var|environment variable|\.env|secret manager|secrets?)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}
