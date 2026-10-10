#!/usr/bin/env node
// Pilot two-arm agent runner. Live calls need GEMINI_API_KEY; --self-test needs none.
import fs from 'fs';
import path from 'path';

const MODEL = 'gemini-3.5-flash-lite';
const AGENT_TIMEOUT_MS = 900000;

function args(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1] ?? true;
  }
  return o;
}

function failClosed(arm, mountPresent) {
  if (arm === 'with' && !mountPresent) throw new Error('with-arm requires skill mount present');
  if (arm === 'without' && mountPresent) throw new Error('without-arm must not see skill mount');
}

async function runArm({ task, arm, skill, out, key }) {
  const taskDir = path.resolve('pilot/tasks', task);
  const taskMd = fs.readFileSync(path.join(taskDir, 'task.md'), 'utf8');
  const mountPath = path.join(taskDir, 'environment', 'skill');
  const mountPresent = fs.existsSync(mountPath);
  failClosed(arm, mountPresent);
  const system = arm === 'with'
    ? fs.readFileSync(path.join(mountPath, 'SKILL.md'), 'utf8')
    : 'You are a helpful assistant.';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AGENT_TIMEOUT_MS);
  let text;
  try {
    const r = await fetch(url, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: taskMd }] }],
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
  const cases = [
    () => failClosed('with', false),
    () => failClosed('without', true)
  ];
  for (const [i, fn] of cases.entries()) {
    let threw = false;
    try { fn(); } catch { threw = true; }
    if (!threw) throw new Error(`self-test case ${i} did not throw`);
  }
  // Positive controls must not throw.
  failClosed('with', true);
  failClosed('without', false);
  const o = args(['--task', 'py-add', '--arm', 'with']);
  if (o.task !== 'py-add' || o.arm !== 'with') throw new Error('arg parse broken');
  console.log('self-test: 3/3 PASS');
}

const o = args(process.argv.slice(2));
if (o['self-test'] !== undefined) {
  await selfTest();
} else {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY required for live runs');
  await runArm({ task: o.task, arm: o.arm, skill: o.skill, out: o.out, key });
}
