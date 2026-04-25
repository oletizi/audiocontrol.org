#!/usr/bin/env node
// Decrypt every session transcript in the sibling audiocontrol repo,
// pull out user messages, and search for the three Socratic patterns.
// Emits `raw-receipts.json` with concrete verbatim examples.
//
// Scoped narrowly: only user messages that are questions (end in '?' or
// start with an interrogative). Each hit includes the session, the
// verbatim user message, and which pattern(s) matched. Agent context
// lives in the full transcript — we don't try to summarize here; the
// dispatch draft will hand-pick exemplars.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = '/Users/orion/work/audiocontrol-work/audiocontrol/data/sessions/content';
const KEY = '/Users/orion/.config/age/audiocontrol.key';
const CACHE = '/tmp/session-content';

if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });

// Pattern classifiers. More permissive than the analysis-layer pass
// because we're looking at raw conversation where the operator's move
// may not produce a correction at all.
const PATTERNS = {
  a_open_ended: [
    /\bwhat('| i)?s (your|the) (plan|approach|thinking|thought|take)\b/i,
    /\bhow (would|should|do|shall|might|could) (you|we)\b/i,
    /\bwhat (should|do|would|could|might) (you|we)\b/i,
    /\bwhat do you think\b/i,
    /\bwhat are you thinking\b/i,
    /\bany (thoughts|ideas|suggestions)\b/i,
    /\bwhy (did|do|does) (you|it)\b/i,
    /\bwhat (other|else)\b/i,
    /\bwhat would you\b/i,
    /\bwhere (would|should|do) (you|we)\b/i,
  ],
  b_agent_drafts: [
    /\binterview me\b/i,
    /\bask me\b/i,
    /\bwhat (do )?you need (from me|to know)\b/i,
    /\bpropose\b/i,
    /\bdraft (a|the|your|me)\b/i,
    /\bsuggest (an?|the|some|options|a)\b/i,
    /\bwhat (questions|clarifications)\b/i,
    /\bwalk me through\b/i,
    /\btell me what you('d| would)\b/i,
    /\bwhat would you propose\b/i,
    /\bgive me (a|the|your) (proposal|recommendation|plan)\b/i,
  ],
  c_standards: [
    /\bclaude\.md\b/i,
    /\bwhat (rule|guideline|standard|directive|convention|instruction)\b/i,
    /\bwhich (rule|guideline|standard|directive|convention|instruction)\b/i,
    /\bwhy does(n't)? (claude\.md|(the )?(project|repo|guideline|rule))\b/i,
    /\bwhat does (claude\.md|the guideline|the rule|the directive)\b/i,
    /\bis there (a|an) (rule|guideline|standard|directive|convention)\b/i,
    /\bare you (supposed|allowed)\b/i,
    /\bwhich (project )?(guideline|standard|directive|convention)\b/i,
  ],
};

function classify(text) {
  const labels = [];
  for (const [label, regs] of Object.entries(PATTERNS)) {
    if (regs.some((re) => re.test(text))) labels.push(label);
  }
  return labels;
}

function isQuestion(text) {
  const t = text.trim();
  if (t.endsWith('?')) return true;
  if (/^(what|how|why|when|where|which|who|whose|whom|should|could|would|is|are|do|does|did|can|will|have|has|had)\b/i.test(t)) return true;
  return false;
}

// Haiku-style summary note: keep messages tightly scoped — drop
// system-reminder dumps, tool-result paste-ins, and multi-thousand-char
// command pastes. Operator intents we care about are short.
function looksLikeOperatorText(text) {
  if (!text) return false;
  const t = text.trim();
  if (t.length < 10 || t.length > 800) return false;
  if (/<system-reminder>/.test(t)) return false;
  if (/<command-name>/.test(t)) return false;
  if (/<local-command-caveat>/.test(t)) return false;
  if (/<command-stdout>/.test(t)) return false;
  if (/<command-stderr>/.test(t)) return false;
  if (/<user-prompt-submit-hook>/.test(t)) return false;
  if (t.startsWith('Caveat:')) return false;
  if (/^---$/.test(t)) return false;
  return true;
}

// Extract plain user text from a Claude Code JSONL entry. The
// extract-session-content tool flattens the schema so `content` is an
// array of blocks directly on the entry (not under `message`).
function userText(entry) {
  if (entry?.type !== 'user') return null;
  const c = entry.content;
  if (typeof c === 'string') return c;
  if (!Array.isArray(c)) return null;
  const parts = [];
  for (const block of c) {
    if (block?.type === 'text' && typeof block.text === 'string') {
      parts.push(block.text);
    }
  }
  return parts.length ? parts.join('\n').trim() : null;
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.jsonl.age')).sort();
const out = { a_open_ended: [], b_agent_drafts: [], c_standards: [] };
const perSessionStats = [];

for (const f of files) {
  const session = f.replace(/\.jsonl\.age$/, '');
  const cachePath = join(CACHE, `${session}.jsonl`);

  if (!existsSync(cachePath)) {
    try {
      execSync(`age -d -i "${KEY}" "${join(SRC, f)}" > "${cachePath}"`, { stdio: 'pipe' });
    } catch (e) {
      console.error(`[skip ${session}] decrypt failed`);
      continue;
    }
  }

  let content;
  try {
    content = readFileSync(cachePath, 'utf-8');
  } catch {
    continue;
  }

  const lines = content.split('\n').filter(Boolean);
  const sessionHits = { a: 0, b: 0, c: 0 };
  for (const line of lines) {
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    const text = userText(e);
    if (!looksLikeOperatorText(text)) continue;
    if (!isQuestion(text)) continue;
    const labels = classify(text);
    if (labels.length === 0) continue;
    for (const label of labels) {
      out[label].push({ session, text });
      if (label === 'a_open_ended') sessionHits.a++;
      else if (label === 'b_agent_drafts') sessionHits.b++;
      else if (label === 'c_standards') sessionHits.c++;
    }
  }
  if (sessionHits.a || sessionHits.b || sessionHits.c) {
    perSessionStats.push({ session, ...sessionHits });
  }
}

// Deduplicate identical text within each bucket (same message may
// appear across the session if the operator repasted it).
for (const bucket of Object.keys(out)) {
  const seen = new Set();
  out[bucket] = out[bucket].filter((h) => {
    const key = `${h.session}::${h.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const stats = {
  sessions_scanned: files.length,
  a_open_ended: out.a_open_ended.length,
  b_agent_drafts: out.b_agent_drafts.length,
  c_standards: out.c_standards.length,
  sessions_with_any: perSessionStats.length,
};

writeFileSync(
  join(HERE, 'raw-receipts.json'),
  JSON.stringify({ stats, per_session: perSessionStats, ...out }, null, 2),
);
console.log(JSON.stringify(stats, null, 2));
