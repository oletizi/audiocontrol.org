---
name: session-start
description: "Bootstrap a session by reading workplan, journal, and open issues."
---

# Session Start

1. Identify feature from worktree: `basename $(pwd)` → strip `audiocontrol.org-` prefix
2. Read `docs/1.0/001-IN-PROGRESS/<slug>/workplan.md`
3. Read `DEVELOPMENT-NOTES.md` (last entry)
4. Run `gh issue list --state open`
5. Report: feature, phase, last session summary, open issues, proposed goal
6. Wait for user confirmation before coding
