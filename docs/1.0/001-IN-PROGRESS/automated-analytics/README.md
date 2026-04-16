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
| 1 | GA4 Data Pipeline | Not Started |
| 2 | Search Console Integration | Not Started |
| 3 | Actionable Report & Recommendations | Not Started |
| 4 | Claude Code Skill | Not Started |

## Prerequisites

- Google Cloud service account with read access to GA4 and Search Console
- GA4 numeric property ID (from GA4 admin panel)
- Google Search Console verified for audiocontrol.org

## Documentation

- [PRD](./prd.md) — Product requirements and technical approach
- [Workplan](./workplan.md) — Implementation phases and task breakdown
