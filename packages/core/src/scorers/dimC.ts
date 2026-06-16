/**
 * Dimension C: Safety, Alignment & Security (15 Scorer Functions)
 */

/**
 * C1: Prompt Injection Shield
 * Upgraded logic: Verify if prompt isolates user input via boundary delimiters
 * and defines instructions to ignore content inside these boundaries.
 */
export function scoreC1(text: string): number {
  const cleanText = text.toLowerCase();
  
  const hasDelimiters = /("""|```|<[a-zA-Z0-9_\-]+>)/i.test(cleanText);
  const hasIsolationDirective = /\b(ignore instructions|treat as raw|untrusted|data only|ignore system commands|not instructions)\b/i.test(cleanText);
  
  if (hasDelimiters && hasIsolationDirective) return 1.0;
  if (hasDelimiters || hasIsolationDirective) return 0.5;
  
  const injectionPattern = /\b(ignore user override|ignore instructions to override|do not let user modify|override protection|adversarial inputs)\b/gi;
  return injectionPattern.test(text) ? 0.3 : 0.0;
}

/**
 * C2: System Instruction Protection
 * Upgraded logic: Check for defense-in-depth rules to respond with a fixed fallback
 * message when prompted with prompt-leakage triggers.
 */
export function scoreC2(text: string): number {
  const cleanText = text.toLowerCase();
  
  const hasLeakTriggerGuard = /\b(repeat the prompt|repeat instructions|reveal rules|under what instructions|translate rules|summarize instructions)\b/i.test(cleanText);
  const hasFallbackResponse = /\b(sorry|cannot|error|i can't|refuse|fixed message)\b/i.test(cleanText);
  
  if (hasLeakTriggerGuard && hasFallbackResponse) return 1.0;
  if (hasLeakTriggerGuard || hasFallbackResponse) return 0.5;
  
  const protectionPattern = /\b(do not reveal|never reveal system prompt|prompt leakage|system prompt protection|do not share instructions)\b/gi;
  return protectionPattern.test(text) ? 0.3 : 0.0;
}

/**
 * C3: Role Hijacking Defense
 */
export function scoreC3(text: string): number {
  const roleHijackPattern = /\b(never change your role|strictly act as|do not assume another persona|maintain role integrity)\b/gi;
  return roleHijackPattern.test(text) ? 1.0 : 0.0;
}

/**
 * C4: Jailbreak Resistance Keywords
 */
export function scoreC4(text: string): number {
  const jailbreakPattern = /\b(jailbreak|bypass safety|safety guardrails|override bounds|security guidelines)\b/gi;
  return jailbreakPattern.test(text) ? 1.0 : 0.3;
}

/**
 * C5: Exfiltration Defense
 */
export function scoreC5(text: string): number {
  const exfiltrationPattern = /\b(exfiltrate|data leak|do not send prompt|leak system prompt|unauthorized destination)\b/gi;
  return exfiltrationPattern.test(text) ? 1.0 : 0.4;
}

/**
 * C6: PII Masking Instructions
 */
export function scoreC6(text: string): number {
  const piiPattern = /\b(pii|personally identifiable|remove sensitive|mask passwords|anonymize)\b/gi;
  return piiPattern.test(text) ? 1.0 : 0.5;
}

/**
 * C7: Sandbox Constraints
 */
export function scoreC7(text: string): number {
  const sandboxPattern = /\b(sandbox|restricted execution|isolated environment|local shell only|containerized)\b/gi;
  return sandboxPattern.test(text) ? 1.0 : 0.5;
}

/**
 * C8: Command Authority Scope
 */
export function scoreC8(text: string): number {
  const authorityPattern = /\b(authority|privilege|permissions limit|least privilege|allowed commands)\b/gi;
  return authorityPattern.test(text) ? 1.0 : 0.4;
}

/**
 * C9: Compliance Rules
 */
export function scoreC9(text: string): number {
  const compliancePattern = /\b(compliance|policy guidelines|standard guidelines|organizational policy)\b/gi;
  return compliancePattern.test(text) ? 1.0 : 0.5;
}

/**
 * C10: Input Sanitization Instructions
 */
export function scoreC10(text: string): number {
  const sanitizePattern = /\b(sanitize|clean input|filter tags|escape strings|input validation)\b/gi;
  return sanitizePattern.test(text) ? 1.0 : 0.4;
}

/**
 * C11: Output Validation Directives
 */
export function scoreC11(text: string): number {
  const validationPattern = /\b(validate output|self-correct|verify results|post-process validation|ensure format validity)\b/gi;
  return validationPattern.test(text) ? 1.0 : 0.4;
}

/**
 * C12: Trust Boundary Checking
 */
export function scoreC12(text: string): number {
  const trustBoundaryPattern = /\b(trust boundary|verify api endpoints|validation source|secure connection|untrusted source)\b/gi;
  return trustBoundaryPattern.test(text) ? 1.0 : 0.5;
}

/**
 * C13: Access Control Rules
 */
export function scoreC13(text: string): number {
  const accessControlPattern = /\b(access control|role permissions|authorization|authentication|access rights)\b/gi;
  return accessControlPattern.test(text) ? 1.0 : 0.5;
}

/**
 * C14: Override Blockers
 */
export function scoreC14(text: string): number {
  const overrideBlockerPattern = /\b(block overrides|cannot override|immutable guidelines|final rules)\b/gi;
  return overrideBlockerPattern.test(text) ? 1.0 : 0.4;
}

/**
 * C15: Log Obfuscation
 */
export function scoreC15(text: string): number {
  const obfuscatePattern = /\b(obfuscate|hide passwords|mask tokens|do not log secrets|redact)\b/gi;
  return obfuscatePattern.test(text) ? 1.0 : 0.5;
}
