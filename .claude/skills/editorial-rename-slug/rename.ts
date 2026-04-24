#!/usr/bin/env -S npx tsx
/*
 * rename.ts — helper for the /editorial-rename-slug skill.
 *
 * Renames a published post's slug cleanly, relying on Phase 18a's
 * stable UUID identity so joins (workflows, distributions, journal
 * history) don't need rewriting.
 *
 * Usage:
 *   npx tsx .claude/skills/editorial-rename-slug/rename.ts \\
 *     --site <site> <old-slug> <new-slug> [--dry-run]
 *
 * Exits non-zero on validation failure with a message that names the
 * specific next step the operator should take.
 *
 * No git operations. The operator reviews the diff and commits.
 */

import { assertSite, renameSlug, type RenameSlugResult } from '../../../scripts/lib/editorial/index.js';

interface Args {
  site: ReturnType<typeof assertSite>;
  oldSlug: string;
  newSlug: string;
  dryRun: boolean;
}

function parseArgs(argv: readonly string[]): Args {
  let site: string | undefined;
  let dryRun = false;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site') { site = argv[++i]; continue; }
    if (a.startsWith('--site=')) { site = a.slice('--site='.length); continue; }
    if (a === '--dry-run' || a === '-n') { dryRun = true; continue; }
    positional.push(a);
  }
  if (positional.length !== 2) {
    throw new Error(
      'Usage: rename.ts --site <site> <old-slug> <new-slug> [--dry-run]',
    );
  }
  return {
    site: assertSite(site),
    oldSlug: positional[0],
    newSlug: positional[1],
    dryRun,
  };
}

function renderPlan(result: RenameSlugResult): string[] {
  const header = result.dryRun
    ? ['(dry-run) plan:', '']
    : ['Renamed.', ''];
  const lines: string[] = [
    ...header,
    `  entryId   ${result.entryId}`,
    `  old slug  ${result.oldSlug}`,
    `  new slug  ${result.newSlug}`,
    '',
    'Actions:',
  ];
  for (const action of result.actions) {
    lines.push(`  - [${action.kind}] ${action.summary}`);
    if (action.details) {
      lines.push(
        action.details
          .split('\n')
          .map((l) => (l.startsWith('         ') ? l : `         ${l}`))
          .join('\n'),
      );
    }
  }

  if (result.dryRun) {
    lines.push('', '(no files written)');
  } else {
    lines.push(
      '',
      'Next (manual):',
      '  git status',
      '  git diff',
      `  git add -A`,
      '  git commit -m "..."',
      '  git push',
      '',
      'The _redirects append serves the 301 for legacy URLs once the',
      "site deploys; internal cross-links in other posts are left",
      'alone and resolve through that redirect.',
    );
  }
  return lines;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const result = renameSlug({
    rootDir: process.cwd(),
    site: args.site,
    oldSlug: args.oldSlug,
    newSlug: args.newSlug,
    dryRun: args.dryRun,
  });
  process.stdout.write(renderPlan(result).join('\n') + '\n');
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`editorial-rename-slug: ${message}\n`);
  process.exit(1);
}
