#!/usr/bin/env node
/*
 * Mine 67 session analyses for patterns relevant to the
 * "Socratic coding agents" dispatch.
 *
 * Looking for:
 *   - Corrections that ARE mental-model-gap signatures
 *     (agent misread the task, not the code)
 *   - Sessions with lots of corrections that would have been cheaper
 *     if the agent had restated the task first
 *   - Patterns mentioning "user clarified," "user redirected,"
 *     "user asked to explain," "user asked to describe"
 *   - Agent strengths around restating/confirming intent
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = '/tmp/session-analysis';
const files = readdirSync(dir).filter(f => f.endsWith('.json'));

let totalSessions = 0;
let totalCorrections = 0;
let sessionsByCorrectionCount = [];
const byCategory = {};
const mentalModelHits = [];
const socraticPatterns = [];
const correctionSignatures = [];

for (const f of files) {
  try {
    const doc = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
    const a = doc.analysis;
    if (!a) continue;
    totalSessions++;
    const cc = a.correction_count ?? (a.corrections || []).length;
    totalCorrections += cc;
    sessionsByCorrectionCount.push({ session: doc.session, count: cc, arc: a.arc_type });

    for (const corr of a.corrections || []) {
      const cat = (corr.category || 'unknown').toLowerCase();
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      const desc = (corr.description || '').toLowerCase();
      correctionSignatures.push({ session: doc.session, category: cat, description: corr.description });
      if (/misund|misread|wrong\s+task|mental model|diverge|got.*wrong|assumed|didn'?t check|didn'?t read|without\s+reading|fabricat|invent/i.test(corr.description || '')) {
        mentalModelHits.push({
          session: doc.session,
          category: cat,
          description: corr.description,
        });
      }
    }

    for (const p of a.patterns || []) {
      if (/restate|clarif|redirect|describe back|interview|paraphras|socrat|brainstorm|plan.*mode|explain.*why|asked.*why|ask the user/i.test(p)) {
        socraticPatterns.push({ session: doc.session, pattern: p });
      }
    }
    for (const s of a.agent_strengths || []) {
      if (/restate|clarif|confirmed|check.*understand/i.test(s)) {
        socraticPatterns.push({ session: doc.session, source: 'strength', pattern: s });
      }
    }
  } catch (e) {
    console.error(`err in ${f}:`, e.message);
  }
}

sessionsByCorrectionCount.sort((a, b) => b.count - a.count);

const report = {
  totals: {
    sessions: totalSessions,
    corrections: totalCorrections,
    avg_per_session: +(totalCorrections / totalSessions).toFixed(2),
  },
  correction_categories: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
  high_correction_sessions: sessionsByCorrectionCount.slice(0, 12),
  zero_correction_sessions: sessionsByCorrectionCount.filter(s => s.count === 0).length,
  mental_model_hits_count: mentalModelHits.length,
  mental_model_samples: mentalModelHits.slice(0, 25),
  socratic_pattern_count: socraticPatterns.length,
  socratic_pattern_samples: socraticPatterns.slice(0, 25),
};

console.log(JSON.stringify(report, null, 2));
writeFileSync('/tmp/session-analysis/patterns.json', JSON.stringify(report, null, 2));
writeFileSync('/tmp/session-analysis/all-corrections.json', JSON.stringify(correctionSignatures, null, 2));
