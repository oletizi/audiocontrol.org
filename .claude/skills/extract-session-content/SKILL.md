---
name: extract-session-content
description: "Ingest Claude Code session transcripts for this monorepo from ~/.claude/projects, extract the conversation content (user messages, assistant text, tool-use calls — stripping bulky tool results and attachments), and encrypt each session with age so the archive can safely live in data/sessions/content/."
user_invocable: true
---

# Extract Session Content

One-step ingestion: reads Claude Code JSONL session logs, strips the
big stuff, writes one encrypted `.jsonl.age` per session under
`data/sessions/content/`. Output is safe to commit.

## Usage

```
npx tsx tools/extract-session-content.ts                    # this project only (default)
npx tsx tools/extract-session-content.ts --all-projects     # every project on the laptop
npx tsx tools/extract-session-content.ts --data-dir <path>  # explicit override
```

**Default scope** is this monorepo's session dir only —
`~/.claude/projects/<encoded-cwd>/`. The tool encodes the cwd the
same way Claude Code does (slashes and dots become hyphens). If you
want to archive transcripts from other worktrees, pass
`--all-projects`.

## Steps

1. **Run the tool:**

   ```
   npx tsx tools/extract-session-content.ts
   ```

   The tool prints the scope, data dir, output dir, and age-key path
   it's using, then a per-session line for every new file it writes:

   ```
   + 2026-04-20_eff0ef6b (482 entries, 1.2MB)
   ```

   It ends with a summary: `Done: <new> new, <skipped> skipped, <errors> errors`.

2. **Relay the summary** to the operator — numbers only, no
   interpretation. The analyze-session pipeline in the sibling
   audiocontrol repo is a separate step that reads the encrypted
   files later.

3. **Stage and commit** if the operator wants:

   ```
   git add data/sessions/content/
   git commit -m "chore(sessions): archive <N> new transcripts"
   ```

   This skill does NOT commit automatically — the operator reviews
   the diff first.

## What gets extracted

For each session's `.jsonl`:

- **User text** — string content of user messages. Tool-result blocks
  are dropped (they're often large paste-backs from tool output).
- **Assistant text** — every `text` block.
- **Assistant thinking** — every `thinking` block, preserved for later
  analysis of reasoning patterns.
- **Tool-use calls** — name + input JSON. Tool outputs are not
  captured (see above).

File-history snapshots, attachment blocks, system events, and
permission-mode entries are skipped.

## Encryption

Each output file is encrypted with [age](https://age-encryption.org)
using the public key derived from `~/.config/age/audiocontrol.key`.
The tool will fail early with a useful message if the key is not
present.

**Decrypt** a single file:

```
age -d -i ~/.config/age/audiocontrol.key data/sessions/content/2026-04-20_eff0ef6b.jsonl.age
```

## Idempotence

The tool tracks which short-IDs already have an encrypted file in
`data/sessions/content/` and skips them. Safe to re-run at the end
of any session — it'll only add what's new.

## Scope

This skill is **extraction + encryption only**. It does not run LLM
analysis or generate reports. The sibling audiocontrol repo's
`analyze-session` skill runs the larger pipeline
(`extract → encrypt → LLM analysis → report`); this one is just the
first two legs, scoped to this monorepo's sessions.
