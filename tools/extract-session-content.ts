/**
 * Session content extractor — parses Claude Code JSONL session logs and
 * extracts conversation content (user messages, assistant text, tool
 * calls) into per-session files, each encrypted with `age` so the
 * archive can safely live in the repo.
 *
 * Ported from the sibling audiocontrol repo's `tools/extract-session-content.ts`.
 * One behavioral difference: the default data-dir is scoped to THIS
 * monorepo's Claude Code session dir (ingest-this-project-only). Pass
 * `--all-projects` for the old behavior (ingest every project under
 * `~/.claude/projects`).
 *
 * Strips tool results and attachments to keep file sizes manageable.
 * Output: data/sessions/content/<date>_<session-id-short>.jsonl.age
 *
 * Encrypted with age (https://age-encryption.org). Decrypt with:
 *   age -d -i ~/.config/age/audiocontrol.key <file>.age
 *
 * Usage:
 *   tsx tools/extract-session-content.ts                   # this project only
 *   tsx tools/extract-session-content.ts --all-projects    # every project
 *   tsx tools/extract-session-content.ts --data-dir <path> # explicit override
 */

import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { execSync } from "node:child_process";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentEntry {
  type: "user" | "assistant";
  timestamp: string;
  content: ExtractedContent[];
}

type ExtractedContent =
  | { type: "text"; text: string }
  | { type: "thinking"; thinking: string }
  | { type: "tool_use"; name: string; input: Record<string, unknown> };

interface RawContentBlock {
  type: string;
  text?: string;
  thinking?: string;
  name?: string;
  input?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// CLI args + project-dir discovery
// ---------------------------------------------------------------------------

/**
 * Claude Code encodes project directories in `~/.claude/projects/` by
 * substituting `/` with `-`. Dots are also rewritten to `-` (observed
 * in the live tree: `/…/audiocontrol.org-editorial-calendar` becomes
 * `-Users-orion-work-audiocontrol-work-audiocontrol-org-editorial-calendar`).
 */
function encodeProjectDir(cwd: string): string {
  return cwd.replace(/\//g, "-").replace(/\./g, "-");
}

function parseArgs(): { dataDir: string; scope: "project" | "all" | "custom" } {
  const args = process.argv.slice(2);
  const projectsRoot = join(process.env.HOME ?? "~", ".claude", "projects");

  // Default: this project only.
  let scope: "project" | "all" | "custom" = "project";
  let dataDir = join(projectsRoot, encodeProjectDir(process.cwd()));

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--all-projects") {
      scope = "all";
      dataDir = projectsRoot;
    } else if (args[i] === "--data-dir" && args[i + 1]) {
      scope = "custom";
      dataDir = resolve(args[i + 1]);
      i++;
    }
  }
  return { dataDir, scope };
}

// ---------------------------------------------------------------------------
// Discover session JSONL files
// ---------------------------------------------------------------------------

async function discoverSessions(
  dataDir: string
): Promise<Array<{ path: string }>> {
  const results: Array<{ path: string }> = [];

  if (!existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`);
    process.exit(1);
  }

  // Handle two shapes:
  //   1. Leaf project dir — `.jsonl` files sit directly inside.
  //   2. Parent-of-projects dir — subdirs each contain `.jsonl` files.
  // Always look for both. If neither yields results we'll just return
  // an empty list; main() reports the count.
  const entries = await readdir(dataDir);
  for (const name of entries) {
    const entryPath = join(dataDir, name);
    const entryStat = await stat(entryPath);
    if (entryStat.isFile() && name.endsWith(".jsonl")) {
      results.push({ path: entryPath });
      continue;
    }
    if (entryStat.isDirectory()) {
      const files = await readdir(entryPath);
      for (const file of files) {
        if (file.endsWith(".jsonl")) {
          results.push({ path: join(entryPath, file) });
        }
      }
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Extract content from a single session
// ---------------------------------------------------------------------------

async function extractContent(
  filePath: string
): Promise<{ entries: ContentEntry[]; startDate: string } | null> {
  const entries: ContentEntry[] = [];
  let startDate = "";

  const rl = createInterface({
    input: createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(line);
    } catch {
      continue;
    }

    const entryType = raw.type as string;
    const timestamp = (raw.timestamp as string) ?? "";

    if (timestamp && (!startDate || timestamp < startDate)) {
      startDate = timestamp;
    }

    if (entryType === "user") {
      const extracted = extractUserContent(raw);
      if (extracted.length > 0) {
        entries.push({ type: "user", timestamp, content: extracted });
      }
    } else if (entryType === "assistant") {
      const extracted = extractAssistantContent(raw);
      if (extracted.length > 0) {
        entries.push({ type: "assistant", timestamp, content: extracted });
      }
    }
    // Skip: file-history-snapshot, attachment, system, permission-mode, etc.
  }

  if (entries.length === 0) return null;
  return { entries, startDate };
}

function extractUserContent(raw: Record<string, unknown>): ExtractedContent[] {
  const message = raw.message as Record<string, unknown> | undefined;
  if (!message) return [];

  const content = message.content;

  // String content — the actual user text
  if (typeof content === "string") {
    return content.trim() ? [{ type: "text", text: content }] : [];
  }

  // Array content — extract text blocks, skip tool_result blocks
  if (Array.isArray(content)) {
    const results: ExtractedContent[] = [];
    for (const block of content) {
      if (typeof block === "object" && block !== null) {
        const b = block as RawContentBlock;
        if (b.type === "text" && b.text?.trim()) {
          results.push({ type: "text", text: b.text });
        }
        // Skip tool_result — these are tool output payloads, often large.
      }
    }
    return results;
  }

  return [];
}

function extractAssistantContent(
  raw: Record<string, unknown>
): ExtractedContent[] {
  const message = raw.message as Record<string, unknown> | undefined;
  if (!message) return [];

  const content = message.content;
  if (!Array.isArray(content)) return [];

  const results: ExtractedContent[] = [];
  for (const block of content) {
    if (typeof block !== "object" || block === null) continue;
    const b = block as RawContentBlock;

    if (b.type === "text" && b.text?.trim()) {
      results.push({ type: "text", text: b.text });
    } else if (b.type === "thinking" && b.thinking?.trim()) {
      results.push({ type: "thinking", thinking: b.thinking });
    } else if (b.type === "tool_use" && b.name) {
      results.push({
        type: "tool_use",
        name: b.name,
        input: b.input ?? {},
      });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Encryption
// ---------------------------------------------------------------------------

const AGE_KEY_PATH = join(
  process.env.HOME ?? "~",
  ".config",
  "age",
  "audiocontrol.key"
);

function getPublicKey(): string {
  if (!existsSync(AGE_KEY_PATH)) {
    throw new Error(
      `age key not found at ${AGE_KEY_PATH}\n` +
        "Generate one with: age-keygen -o ~/.config/age/audiocontrol.key"
    );
  }

  const keyFile = readFileSync(AGE_KEY_PATH, "utf8");
  const pubLine = keyFile
    .split("\n")
    .find((l: string) => l.startsWith("# public key: "));
  if (!pubLine) {
    throw new Error(`Could not find public key in ${AGE_KEY_PATH}`);
  }
  return pubLine.replace("# public key: ", "").trim();
}

function encryptAndWrite(
  data: string,
  outputPath: string,
  publicKey: string
): void {
  execSync(`age -r ${publicKey} -o "${outputPath}"`, {
    input: data,
    encoding: "utf8",
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { dataDir, scope } = parseArgs();
  const publicKey = getPublicKey();

  // Output lives next to the tool, under <repo>/data/sessions/content/.
  const contentDir = resolve(
    import.meta.dirname ?? process.cwd(),
    "..",
    "data",
    "sessions",
    "content"
  );
  mkdirSync(contentDir, { recursive: true });

  const scopeLabel =
    scope === "project"
      ? "this project only"
      : scope === "all"
      ? "all projects"
      : "custom dir";
  console.log(`Scope:     ${scopeLabel}`);
  console.log(`Data dir:  ${dataDir}`);
  console.log(`Output:    ${contentDir}/`);
  console.log(`Key:       ${AGE_KEY_PATH}`);

  const sessions = await discoverSessions(dataDir);
  console.log(`Found ${sessions.length} session files`);

  // Skip sessions whose short ID is already in the output directory.
  // Deduplicate full IDs across project dirs while we're walking.
  const existingShortIds = new Set<string>();
  const processedFullIds = new Set<string>();
  for (const f of await readdir(contentDir)) {
    const match = f.match(/_([a-f0-9]+)\.jsonl\.age$/);
    if (match) existingShortIds.add(match[1]);
  }

  let newCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const session of sessions) {
    const sessionId = basename(session.path, ".jsonl");
    const shortId = sessionId.slice(0, 8);

    if (existingShortIds.has(shortId) || processedFullIds.has(sessionId)) {
      skipCount++;
      continue;
    }
    processedFullIds.add(sessionId);

    try {
      const result = await extractContent(session.path);
      if (!result) {
        skipCount++;
        continue;
      }

      const datePrefix = result.startDate.slice(0, 10);
      const outputFile = join(
        contentDir,
        `${datePrefix}_${shortId}.jsonl.age`
      );

      const plaintext =
        result.entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
      encryptAndWrite(plaintext, outputFile, publicKey);

      const sizeMB = (statSync(outputFile).size / 1e6).toFixed(1);
      console.log(
        `  + ${datePrefix}_${shortId} (${result.entries.length} entries, ${sizeMB}MB)`
      );
      newCount++;
    } catch (err) {
      errorCount++;
      console.error(`  ! Error: ${session.path}: ${err}`);
    }
  }

  console.log(
    `\nDone: ${newCount} new, ${skipCount} skipped, ${errorCount} errors`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
