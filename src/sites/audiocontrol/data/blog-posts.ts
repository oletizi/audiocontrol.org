/**
 * audiocontrol.org blog post index.
 *
 * Hand-maintained list of published posts. Blog index renders all of
 * them; homepage surfaces the latest few via `recentBlogPosts()`.
 *
 * Future: Astro content collections can replace this once the MD
 * frontmatter conventions stabilize. For now a single source of truth
 * beats divergence between pages.
 */

export interface BlogPost {
  title: string;
  description: string;
  /** Human-readable date shown in UI (e.g. "April 2026"). */
  date: string;
  /** ISO date for <time datetime> and sorting. */
  datePublished: string;
  slug: string;
  image?: string;
  tags?: string[];
}

export const blogPosts: readonly BlogPost[] = [
  {
    title: "Instructions Are Not Enough: What 2,400 Sessions Taught Us About AI Agent Workflow",
    description: "Telling an AI agent what to do is easy. Getting it to reliably follow process requires something structural — skills, session journals, and correction-driven guardrails.",
    date: "April 2026",
    datePublished: "2026-04-17",
    slug: "what-2400-session-taught-us-about-agent-workflow",
    image: "/images/blog/what-2400-session-taught-us-about-agent-workflow/feature-filtered.png",
    tags: ["AI", "Claude", "Workflow", "Process"],
  },
  {
    title: "Two AIs, One Feature: What Happened When Claude and Codex Built the Same Thing",
    description: "Claude Code and Codex independently implemented the same draggable zone feature for the Akai S3000XL editor. The code was comparable. The sessions were not.",
    date: "April 2026",
    datePublished: "2026-04-13",
    slug: "claude-vs-codex-claude-perspective",
    image: "/images/blog/claude-vs-codex-claude-perspective/feature-filtered.png",
    tags: ["AI", "Claude", "Codex", "Akai", "S3000XL"],
  },
  {
    title: "What Happened When We Asked Claude and Codex to Build the Same Feature",
    description: "We asked two AI coding agents to implement the same draggable zone editing feature for the Akai S3000XL editor. The most useful comparison wasn't about code quality -- it was about failure modes.",
    date: "April 2026",
    datePublished: "2026-04-13",
    slug: "claude-vs-codex-codex-perspective",
    image: "/images/blog/claude-vs-codex-codex-perspective/feature-filtered.png",
    tags: ["AI", "Claude", "Codex", "Akai", "S3000XL"],
  },
  {
    title: "SCSI Over WiFi: Talking to Vintage Hardware from Your Phone",
    description: "An open-source Raspberry Pi bridge that lets you send SCSI commands to vintage samplers and computers over HTTP and WebSocket -- no SCSI card required.",
    date: "April 2026",
    datePublished: "2026-04-07",
    slug: "scsi-over-wifi-raspberry-pi-bridge",
    image: "/images/scsi-over-wifi.png",
    tags: ["SCSI", "Raspberry Pi", "Open Source", "PiSCSI"],
  },
  {
    title: "Reverse-Engineering the Akai S3000XL MIDI-over-SCSI Protocol: An Odyssey",
    description: "How a failed attempt to run Akai's MESA II in a Mac OS 9 emulator led us through 38 disproven theories in five days of intense debugging, and ultimately to a standalone 68k emulator that cracked the protocol in four hours.",
    date: "April 2026",
    datePublished: "2026-04-07",
    slug: "reverse-engineering-akai-s3000xl-midi-over-scsi",
    image: "/images/blog/reverse-engineering-akai-s3000xl-midi-over-scsi/feature-filtered.png",
    tags: ["Akai", "S3000XL", "SCSI", "Reverse Engineering"],
  },
  {
    title: "What's New in the Roland S-330 Web Editor: February 2026",
    description: "Real-time hardware sync, integrated video capture, debug tools, and quality-of-life improvements for the free S-330 sampler editor.",
    date: "February 2026",
    datePublished: "2026-02-09",
    slug: "roland-s330-sampler-editor-feb-2026-update",
    tags: ["Roland", "S-330", "Release"],
  },
  {
    title: "The Roland S-Series Samplers: A Complete Guide",
    description: "A comprehensive guide to Roland's S-series sampler family — from the affordable S-330 to the flagship S-770, including the W-30 workstation.",
    date: "February 2025",
    datePublished: "2025-02-15",
    slug: "roland-s-series-samplers",
    image: "/images/s-330-feature.jpg",
    tags: ["Roland", "S-330", "S-550", "S-770"],
  },
  {
    title: "A Free, Open Source Web Editor for the Roland S-330 Sampler",
    description: "A guide to the Roland S-330 sampler and the open-source web editor for modern workflows.",
    date: "January 2025",
    datePublished: "2025-01-15",
    slug: "free-roland-s330-sampler-editor",
    image: "/images/s-330-feature.jpg",
    tags: ["Roland", "S-330", "Open Source"],
  },
];

export function recentBlogPosts(limit = 3): readonly BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished))
    .slice(0, limit);
}

export function formatBlogDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
