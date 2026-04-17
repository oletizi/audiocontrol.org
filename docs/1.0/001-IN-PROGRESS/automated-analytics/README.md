# Automated Analytics

**Status:** In Progress
**Feature Branch:** `feature/automated-analytics`
**Worktree:** `~/work/audiocontrol-work/audiocontrol.org-automated-analytics`
**GitHub Issue:** oletizi/audiocontrol.org#30

## Overview

Automated analytics pipeline that pulls data from GA4 and Google Search Console, computes actionable content performance metrics, and produces reports via a Claude Code skill. Designed to feed a virtuous cycle: measure content effectiveness, diagnose issues, and act via the editorial calendar.

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
