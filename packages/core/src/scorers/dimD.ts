import { ParsedMarkdown } from '../types.js';

/**
 * Dimension D: Tool-Use & MCP Clarity (15 Scorer Functions)
 */

function getText(input: string | ParsedMarkdown): string {
  return typeof input === 'string' ? input : input.bodyText;
}

function getParams(text: string): string[] {
  const matches = text.match(/\b(parameter|argument|field|property|flag|option)\b/gi);
  return matches || [];
}

/**
 * D1: Parameter Spec Clarity
 */
export function scoreD1(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const params = getParams(text);
  if (params.length === 0) return 0.85;

  const types = text.match(/\b(string|number|boolean|array|object|integer|float|enum|path|url|json|yaml)\b/gi) || [];
  return Math.min(1.0, Math.max(0.4, types.length / params.length));
}

/**
 * D2: Required Field Spec
 */
export function scoreD2(input: string | ParsedMarkdown): number {
  const text = getText(input);
  return /\b(required|mandatory|optional|required fields?|required properties|must provide|must specify)\b/gi.test(text) ? 1.0 : 0.5;
}

/**
 * D3: Argument Description Quality
 */
export function scoreD3(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const params = getParams(text);
  if (params.length === 0) return 0.85;

  const descriptions = text.match(/[-:]\s*[a-zA-Z0-9\s`'"_./-]{10,}/gi) || [];
  return Math.min(1.0, Math.max(0.4, descriptions.length / params.length));
}

/**
 * D4: Parallel / Sequential Execution Control
 */
export function scoreD4(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(parallel|simultaneous|sequential|in parallel|one at a time|concurrent|async|await|order)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * D5: Rate Limit & Quota Guidelines
 */
export function scoreD5(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(rate limit|exponential backoff|429|too many requests|retry budget|quota|throttle|backoff)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * D6: Tool / API Error Response Handling
 */
export function scoreD6(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(tool failure|api error|response code|status code|exit code|non-zero|network failure|error handling|fails?|failure|stderr|exception)\b/gi;
  const count = (text.match(pattern) || []).length;
  return Math.min(1.0, 0.4 + count * 0.2);
}

/**
 * D7: Tool Output Parsing & Extraction
 */
export function scoreD7(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(parse|extract|output parser|regex|json|jq|stdout|response|inspect output|read output)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * D8: Tool Selection Logic
 */
export function scoreD8(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(choose|select|prefer|use\s+[`a-z0-9_-]+\s+(?:over|instead|when|for)|decision|criteria|when to use|mcp|cli|tool)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * D9: Input Encoding & Format Specifications
 */
export function scoreD9(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(encoding|base64|utf-?8|url[- ]?encode|escape|serialize|format|json|yaml|markdown|csv)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * D10: Execution Sequence & Dependency Constraints
 */
export function scoreD10(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(first|before|after|then|prerequisite|pre-requisite|dependency|depends on|in order|step\s*1)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * D11: Fail-safe Defaults
 */
export function scoreD11(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(failsafe|fail[- ]?safe|default|backup|fallback|graceful|safe default)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * D12: Schema & Contract Conformance Checks
 */
export function scoreD12(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(validate|conformance|schema|compliance|type[- ]?check|verify|assert|contract)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * D13: Payload & Output Size Limits
 */
export function scoreD13(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(payload limit|max size|chunk|split|truncate|pagination|paginate|limit|offset|cursor|size limit)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * D14: Async / Callback / Polling Specifications
 */
export function scoreD14(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(callback|webhook|async|event|listener|polling|stream|background|await|promise)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * D15: Resource Clean-up
 */
export function scoreD15(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(release resources?|close connection|clean ?up|free memory|dispose|teardown|remove temp|delete temp|rollback|revert)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}
