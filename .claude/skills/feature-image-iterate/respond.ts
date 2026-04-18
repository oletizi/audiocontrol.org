#!/usr/bin/env tsx
/*
 * respond.ts — execute one iterate response. Bundles the three write steps
 * (generate/recomposite OR clarify, append-assistant, apply-result) so Claude
 * only needs one pre-approved command per workflow item.
 *
 * Usage:
 *   tsx .claude/skills/feature-image-iterate/respond.ts --payload=<json-file>
 *
 * The payload file is a single JSON object describing the response to send.
 * The bundling keeps the argv small (heredocs / quoted JSON on the command
 * line blow up permission-gate parsing).
 *
 * Payload shape:
 *
 *   {
 *     "workflowId": "<uuid>",            // required
 *     "threadId":   "<root-entry-id>",   // required
 *     "assistantText": "<explanation>",  // required
 *     "strategy": "generate" | "recomposite" | "clarify",
 *     "base": "http://localhost:4322",   // optional, default shown
 *
 *     // strategy === "generate"
 *     "generate": {
 *       "prompt": "...", "provider": "flux" | "dalle" | "both",
 *       "preset": "retro-crt", "filters": "scanlines,grain", // optional
 *       "title": "...", "subtitle": "...",
 *       "formats": "og", "parentEntryId": "<source-id>",
 *       "templateSlug": "optional"
 *     }
 *
 *     // strategy === "recomposite"
 *     "recomposite": {
 *       "sourceEntryId": "<id>",
 *       "title": "...", "subtitle": "...",
 *       "preset": "...", "filters": { "grade": "crt", ... },
 *       "overlay": true, "formats": ["og"]
 *     }
 *
 *     // strategy === "clarify"
 *     // (no extra fields — no generation; just posts the assistant text and
 *     // marks the workflow applied.)
 *   }
 */

import { readFileSync } from 'fs';

interface Payload {
  workflowId: string;
  threadId: string;
  assistantText: string;
  strategy: 'generate' | 'recomposite' | 'clarify';
  base?: string;
  generate?: Record<string, unknown>;
  recomposite?: Record<string, unknown>;
}

function parsePayload(): Payload {
  const arg = process.argv.slice(2).find(a => a.startsWith('--payload='));
  if (!arg) throw new Error('missing --payload=<json-file>');
  const path = arg.slice('--payload='.length);
  const raw = readFileSync(path, 'utf-8');
  const payload = JSON.parse(raw) as Payload;
  if (!payload.workflowId) throw new Error('workflowId required');
  if (!payload.threadId) throw new Error('threadId required');
  if (!payload.assistantText) throw new Error('assistantText required');
  if (!['generate', 'recomposite', 'clarify'].includes(payload.strategy)) {
    throw new Error(`strategy must be generate | recomposite | clarify (got ${payload.strategy})`);
  }
  return payload;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return parsed as T;
}

async function main() {
  const payload = parsePayload();
  const base = payload.base ?? 'http://localhost:4322';

  let newEntryId: string | undefined;
  let changedFiles: string[] = [];

  if (payload.strategy === 'generate') {
    if (!payload.generate) throw new Error('generate payload missing');
    const result = await postJson<{ entry: { id: string; outputs?: { raw?: string[]; filtered?: string[]; composited?: Array<{ path: string }> } } }>(
      `${base}/api/dev/feature-image/generate`,
      payload.generate,
    );
    newEntryId = result.entry.id;
    changedFiles = [
      ...(result.entry.outputs?.raw ?? []),
      ...(result.entry.outputs?.filtered ?? []),
      ...(result.entry.outputs?.composited?.map(c => c.path) ?? []),
    ];
    console.log(`generated entry ${newEntryId}`);
  } else if (payload.strategy === 'recomposite') {
    if (!payload.recomposite) throw new Error('recomposite payload missing');
    const result = await postJson<{ entry: { id: string; outputs?: { raw?: string[]; filtered?: string[]; composited?: Array<{ path: string }> } } }>(
      `${base}/api/dev/feature-image/recomposite`,
      payload.recomposite,
    );
    newEntryId = result.entry.id;
    changedFiles = [
      ...(result.entry.outputs?.filtered ?? []),
      ...(result.entry.outputs?.composited?.map(c => c.path) ?? []),
    ];
    console.log(`recomposited entry ${newEntryId}`);
  } else {
    // clarify — no generation
    console.log(`clarifying (no generation)`);
  }

  // Always post the assistant message.
  await postJson(`${base}/api/dev/feature-image/threads`, {
    action: 'append-assistant',
    threadId: payload.threadId,
    text: payload.assistantText,
    ...(newEntryId ? { logEntryId: newEntryId } : {}),
  });
  console.log(`assistant message posted to thread ${payload.threadId}`);

  // Mark workflow applied.
  await postJson(`${base}/api/dev/feature-image/workflow`, {
    action: 'apply-result',
    id: payload.workflowId,
    changedFiles,
  });
  console.log(`workflow ${payload.workflowId} marked applied`);
}

main().catch(err => {
  console.error(`respond failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
