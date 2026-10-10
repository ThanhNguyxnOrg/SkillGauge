#!/usr/bin/env node
// Pilot two-arm agent runner. Live calls need GEMINI_API_KEY; --self-test needs none.
import fs from 'fs';
import path from 'path';

const MODEL = 'gemini-3.5-flash-lite';
const AGENT_TIMEOUT_MS = 900000;
const ARMS = ['with', 'without'];

function args(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1] ?? true;
  }
  return o;
}

function failClosed(arm, skillFilePresent) {
  if (!ARMS.includes(arm)) throw new Error(`unknown arm ${arm}`);
  if (arm === 'with' && !skillFilePresent) throw new Error('with-arm requires skill file present');
  if (arm === 'without' && skillFilePresent) throw new Error('without-arm must not see skill file');
}

// Pure prompt builder (network-free, self-testable): user text = task.md plus
// every environment file except the skill mount; system = skill or bare sentence.
function buildPrompt(taskDir, arm) {
  if (!ARMS.includes(arm)) throw new Error(`unknown arm ${arm}`);
  const taskMd = fs.readFileSync(path.join(taskDir, 'task.md'), 'utf8');
  const envDir = path.join(taskDir, 'environment');
  const parts = [taskMd.trim()];
  for (const e of fs.readdirSync(envDir)) {
    if (e === 'skill') continue;
    parts.push(`--- ${e} ---\n` + fs.readFileSync(path.join(envDir, e), 'utf8').trim());
  }
  const skillFile = path.join(envDir, 'skill', 'SKILL.md');
  const skillFilePresent = fs.existsSync(skillFile);
  failClosed(arm, skillFilePresent);
  const system = arm === 'with' ? fs.readFileSync(skillFile, 'utf8') : 'You are a helpful assistant.';
  return { system, user: parts.join('\n\n') };
}

async function runArm({ task, arm, skill, out, key }) {
  const taskDir = path.resolve('pilot/tasks', task);
  if (!fs.existsSync(path.join(taskDir, 'task.md'))) throw new Error(`unknown task ${task}`);
  const { system, user } = buildPrompt(taskDir, arm);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AGENT_TIMEOUT_MS);
  let text;
  try {
    const r = await fetch(url, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: user }] }],
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: { temperature: 0 }
      })
    });
    const j = await r.json();
    text = j.candidates?.[0]?.content?.parts?.[0]?.text ?? `[AGENT_TIMEOUT_OR_EMPTY status=${r.status}]`;
  } catch (e) {
    text = `[AGENT_TIMEOUT_OR_EMPTY error=${String(e).slice(0, 120)}]`;
  } finally {
    clearTimeout(timer);
  }
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'output.txt'), text);
  // Python tasks grade output.py: extract the first python fence, else raw text.
  if (task.startsWith('py-')) {
    const m = text.match(/```python\n([\s\S]*?)```/i) || text.match(/```\n([\s\S]*?)```/);
    fs.writeFileSync(path.join(out, 'output.py'), (m ? m[1] : text).trim() + '\n');
  }
  fs.writeFileSync(path.join(out, 'trajectory.json'), JSON.stringify({ task, arm, model: MODEL, temperature: 0, skill, at: new Date().toISOString() }, null, 2));
}

async function selfTest() {
  // fail-closed file checks
  for (const fn of [() => failClosed('with', false), () => failClosed('without', true)]) {
    let threw = false;
    try { fn(); } catch { threw = true; }
    if (!threw) throw new Error('fail-closed case did not throw');
  }
  failClosed('with', true);
  failClosed('without', false);
  // arm enum
  let threw = false;
  try { failClosed('With', false); } catch { threw = true; }
  if (!threw) throw new Error('bad arm accepted');
  // prompt builder sends the snippet (C2): review-null user text must contain it
  const p = buildPrompt(path.resolve('pilot/tasks/review-null'), 'without');
  if (!p.user.includes('sk-live-abc123')) throw new Error('snippet missing from prompt');
  if (!p.user.includes('Review the code snippet')) throw new Error('task.md missing from prompt');
  const o = args(['--task', 'py-add', '--arm', 'with']);
  if (o.task !== 'py-add' || o.arm !== 'with') throw new Error('arg parse broken');
  console.log('self-test: 5/5 PASS');
}

const o = args(process.argv.slice(2));
if (o['self-test'] !== undefined) {
  await selfTest();
} else {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY required for live runs');
  await runArm({ task: o.task, arm: o.arm, skill: o.skill, out: o.out, key });
}
