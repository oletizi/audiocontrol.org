# Automated Analytics

**Status:** Ready for Merge
**Feature Branch:** `feature/automated-analytics`
**Worktree:** `~/work/audiocontrol-work/audiocontrol.org-automated-analytics`
**GitHub Issue:** oletizi/audiocontrol.org#30
**Pull Request:** oletizi/audiocontrol.org#45

## Overview

Automated analytics pipeline pulling from Umami Cloud, GA4 Data API, and Google Search Console. Produces content scorecard, search performance analysis, content-to-editor funnel, and ranked recommendations via a `/analytics` Claude Code skill.

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Umami Data Pipeline | Complete |
| 2 | Search Console Integration | Complete |
| 3 | Actionable Report & Recommendations | Complete |
| 4 | Claude Code Skill | Complete |

## Prerequisites

- Umami Cloud API key (`~/.config/audiocontrol/umami-key.json`)
- Google Cloud service account with Search Console read access
- Google Search Console verified for audiocontrol.org

## Documentation

- [PRD](./prd.md) — Product requirements and technical approach
- [Workplan](./workplan.md) — Implementation phases and task breakdown
