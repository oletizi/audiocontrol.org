#!/usr/bin/env node
// Mine the 76 analysis JSONs under /tmp/session-analysis/ for concrete
// receipts of the three Socratic benefits the operator proposed:
//
//   (a) Open-ended solution space — operator asks about approach; agent's
//       answer surfaces design space + hidden assumptions instead of
//       executing one path.
//   (b) Agent-as-prompt-drafter — operator asks the agent to propose the
//       move / write its own instructions; operator hones via follow-ups.
//   (c) Standards-surfacing — operator asks the agent which project
//       directive is at play; the act loads the directive into context
//       AND exposes undocumented guidelines.
//
// Reads every analysis JSON; emits `socratic-receipts.json` with one
// entry per hit, grouped by claim. Each hit carries the session id,
// the verbatim `user_quote` (or nearest field), and the context it came
// from (correction | pattern | agent_strength | improvement_suggestion).
//
// Keyword filters are conservative — false positives are worse than
// false negatives for a dispatch that promises "receipts."

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = '/tmp/session-analysis';

// ---- Claim classifiers ----------------------------------------------------

// (a) Open-ended solution-space questions. "What/how" about approach.
const OPEN_ENDED = [
  /\bwhat('| i)?s (your|the) (plan|approach|thinking)/i,
  /\bhow (would|should|do|shall) (you|we)\b/i,
  /\bwhat (should|do|would) (you|we)\b/i,
  /\bwhat (are|is) (you|your)\s+(thinking|thought|ideas|take)/i,
  /\bwhat do you think\b/i,
  /\bany (thoughts|ideas)\b/i,
  /\bwhat (makes|made) you\b/i, // surfaces agent's hidden reasoning
  /\bwhy did you (choose|pick|think|assume|decide)\b/i,
  /\bwhat other (options|approaches|ways)\b/i,
];

// (b) Agent-as-prompt-drafter. Operator asks the agent to propose, draft,
// or interview them.
const AGENT_DRAFTS = [
  /\binterview me\b/i,
  /\bask me\b/i,
  /\bwhat (do )?you need (from me|to know)\b/i,
  /\bpropose\b/i,
  /\bdraft (a|the|your)\b/i,
  /\bsuggest (an?|the|some|options)\b/i,
  /\bwhat (questions|clarifications)\b/i,
  /\bwalk me through\b/i,
];

// (c) Standards-surfacing. Operator asks the agent to name the rule.
const STANDARDS = [
  /\b(claude\.md|claude_md|\/rules\/|guideline|directive|convention)\b/i,
  /\bwhat (rule|guideline|standard|directive|convention)\b/i,
  /\bwhich (rule|guideline|standard|directive)\b/i,
  /\bwhat does (the )?(claude\.md|project|repo|guideline)\b/i,
  /\bis there (a|an) (rule|guideline|standard|directive|convention)\b/i,
  /\bwhy (did|do) (you|we)\b.*\b(use|do|run|skip)\b/i, // "why did you use mv instead of git mv"
  /\bare you (supposed|allowed)\b/i,
  /\bshould (you|we)\b.*\b(delegate|use|run|skip)\b/i,
];

// Quick classifier: return all matched claim labels.
function classify(text) {
  const labels = [];
  if (OPEN_ENDED.some((re) => re.test(text))) labels.push('a_open_ended');
  if (AGENT_DRAFTS.some((re) => re.test(text))) labels.push('b_agent_drafts');
  if (STANDARDS.some((re) => re.test(text))) labels.push('c_standards');
  return labels;
}

// ---- Extract ---------------------------------------------------------------

const out = { a_open_ended: [], b_agent_drafts: [], c_standards: [] };
const files = readdirSync(SRC).filter((f) => f.endsWith('.json')).sort();

for (const f of files) {
  let j;
  try {
    j = JSON.parse(readFileSync(join(SRC, f), 'utf-8'));
  } catch {
    continue;
  }
  const session = j.session ?? f.replace(/\.json$/, '');
  const a = j.analysis ?? {};

  // Corrections: user_quote is the operator's verbatim line.
  for (const c of a.corrections ?? []) {
    const q = typeof c.user_quote === 'string' ? c.user_quote.trim() : '';
    if (!q || q.length < 4) continue;
    for (const label of classify(q)) {
      out[label].push({
        session,
        where: 'correction',
        category: c.category,
        quote: q,
        desc: c.description,
      });
    }
  }

  // Patterns: prose descriptions; match in a lower-confidence bucket
  // (no verbatim quote, but often describes the move).
  for (const p of a.patterns ?? []) {
    if (typeof p !== 'string') continue;
    for (const label of classify(p)) {
      out[label].push({
        session,
        where: 'pattern',
        quote: null,
        desc: p,
      });
    }
  }

  // Agent strengths: where Haiku noted the agent asked good questions
  // back (evidence for the *operator's* method being answered in kind).
  for (const s of a.agent_strengths ?? []) {
    if (typeof s !== 'string') continue;
    if (/\b(clarif|question|interview|propose)/i.test(s)) {
      out.a_open_ended.push({
        session,
        where: 'agent_strength',
        quote: null,
        desc: s,
      });
    }
  }
}

// Stats
const stats = {
  a_open_ended: out.a_open_ended.length,
  b_agent_drafts: out.b_agent_drafts.length,
  c_standards: out.c_standards.length,
  total_sessions_scanned: files.length,
};

writeFileSync(
  join(HERE, 'socratic-receipts.json'),
  JSON.stringify({ stats, ...out }, null, 2),
);
console.log(JSON.stringify(stats, null, 2));
