import { getWords } from './dimA.js';

// Helper to count words inside parameter blocks
function getParams(text: string): string[] {
  const matches = text.match(/\b(parameter|argument|field|property)\b/gi);
  return matches || [];
}

/**
 * D1: Parameter Spec Clarity
 */
export function scoreD1(text: string): number {
  const params = getParams(text);
  if (params.length === 0) return 1.0;
  
  // Look for types like string, number, boolean, array, object
  const types = text.match(/\b(string|number|boolean|array|object|integer|float)\b/gi) || [];
  return Math.min(1.0, types.length / params.length);
}

/**
 * D2: Required Field Spec
 */
export function scoreD2(text: string): number {
  return /\b(required|mandatory|required fields|required properties)\b/gi.test(text) ? 1.0 : 0.5;
}

/**
 * D3: Argument Description Quality
 */
export function scoreD3(text: string): number {
  const params = getParams(text);
  if (params.length === 0) return 1.0;
  
  // Find parameters defined with descriptions (usually separated by colon or dash)
  const descriptions = text.match(/[-:]\s*[a-zA-Z0-9\s]{10,}/gi) || [];
  return Math.min(1.0, descriptions.length / params.length);
}

/**
 * D4: Parallel Call Control
 */
export function scoreD4(text: string): number {
  const parallelPattern = /\b(parallel call|simultaneous tool|sequential call|execute in parallel|sequential execution)\b/gi;
  return parallelPattern.test(text) ? 1.0 : 0.5;
}

/**
 * D5: Rate Limit Guidelines
 */
export function scoreD5(text: string): number {
  const rateLimitPattern = /\b(rate limit|exponential backoff|429|too many requests|retry budget)\b/gi;
  return rateLimitPattern.test(text) ? 1.0 : 0.4;
}

/**
 * D6: Error Response Handling
 */
export function scoreD6(text: string): number {
  const errorPattern = /\b(tool failure|api error|response code|unexpected status|network failure)\b/gi;
  const matches = text.match(errorPattern);
  const count = matches ? matches.length : 0;
  return Math.min(1.0, count / 3.0);
}

/**
 * D7: Tool Output Parsers
 */
export function scoreD7(text: string): number {
  const parserPattern = /\b(parse tool response|extract json|output parser|regex matches|response extraction)\b/gi;
  return parserPattern.test(text) ? 1.0 : 0.5;
}

/**
 * D8: Tool Selection Logic
 */
export function scoreD8(text: string): number {
  const selectionPattern = /\b(choose tool|select api|determine which tool|tool criteria|decision logic)\b/gi;
  return selectionPattern.test(text) ? 1.0 : 0.4;
}

/**
 * D9: Input Encoding Specifications
 */
export function scoreD9(text: string): number {
  const encodingPattern = /\b(encoding|base64|utf-8|url encode|binary conversion)\b/gi;
  return encodingPattern.test(text) ? 1.0 : 0.5;
}

/**
 * D10: Execution Sequence Constraints
 */
export function scoreD10(text: string): number {
  const sequencePattern = /\b(first call|then call|sequence constraints|pre-requisite tool|dependency chain)\b/gi;
  return sequencePattern.test(text) ? 1.0 : 0.5;
}

/**
 * D11: Fail-safe Defaults
 */
export function scoreD11(text: string): number {
  const failsafePattern = /\b(failsafe|default value|backup data|fallback value|graceful default)\b/gi;
  return failsafePattern.test(text) ? 1.0 : 0.3;
}

/**
 * D12: Schema Conformance checks
 */
export function scoreD12(text: string): number {
  const conformancePattern = /\b(validate schema|conformance|schema compliance|validate parameters|check argument structure)\b/gi;
  return conformancePattern.test(text) ? 1.0 : 0.5;
}

/**
 * D13: Payload Size Limits
 */
export function scoreD13(text: string): number {
  const payloadLimitPattern = /\b(payload limit|max size|chunk size|split payload|truncate body)\b/gi;
  return payloadLimitPattern.test(text) ? 1.0 : 0.5;
}

/**
 * D14: Callback Specifications
 */
export function scoreD14(text: string): number {
  const callbackPattern = /\b(callback|webhook|async event|listener|polling response)\b/gi;
  return callbackPattern.test(text) ? 1.0 : 0.5;
}

/**
 * D15: Resource Clean-up
 */
export function scoreD15(text: string): number {
  const cleanupPattern = /\b(release resources|close connection|clean up handles|free memory|dispose)\b/gi;
  return cleanupPattern.test(text) ? 1.0 : 0.5;
}
