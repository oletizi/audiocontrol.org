import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { writeFileSync, mkdirSync } from "fs";

const width = 800;
const height = 480;
const outDir = "public/images/blog/claude-vs-codex";
mkdirSync(outDir, { recursive: true });

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour: "#1a1a1a",
});

const claude = "rgba(129, 140, 248, 1)"; // indigo
const claudeBg = "rgba(129, 140, 248, 0.7)";
const codex = "rgba(52, 211, 153, 1)"; // emerald
const codexBg = "rgba(52, 211, 153, 0.7)";

const commonScaleOptions = {
  ticks: { color: "#a1a1aa" },
  grid: { color: "rgba(161, 161, 170, 0.15)" },
};

const commonPlugins = {
  legend: {
    labels: { color: "#e4e4e7", font: { size: 13 } },
  },
  title: {
    display: true,
    color: "#e4e4e7",
    font: { size: 18, weight: "bold" },
  },
};

async function render(name, config) {
  const buf = await chartJSNodeCanvas.renderToBuffer(config);
  const path = `${outDir}/${name}.png`;
  writeFileSync(path, buf);
  console.log(`wrote ${path}`);
}

// 1. Implementation Scale
await render("implementation-scale", {
  type: "bar",
  data: {
    labels: [
      "Source files",
      "Source lines",
      "Test lines",
      "Largest file",
      "Commits",
    ],
    datasets: [
      {
        label: "Claude Code",
        data: [15, 1710, 1460, 307, 9],
        backgroundColor: claudeBg,
        borderColor: claude,
        borderWidth: 1,
      },
      {
        label: "Codex",
        data: [19, 1760, 1175, 557, 7],
        backgroundColor: codexBg,
        borderColor: codex,
        borderWidth: 1,
      },
    ],
  },
  options: {
    plugins: {
      ...commonPlugins,
      title: { ...commonPlugins.title, text: "Implementation Scale" },
    },
    scales: { x: commonScaleOptions, y: commonScaleOptions },
  },
});

// 2. Test Coverage by Category (stacked bar)
await render("test-coverage", {
  type: "bar",
  data: {
    labels: ["Claude Code", "Codex"],
    datasets: [
      {
        label: "Coordinate math",
        data: [221, 44],
        backgroundColor: "rgba(129, 140, 248, 0.85)",
        borderColor: "rgba(129, 140, 248, 1)",
        borderWidth: 1,
      },
      {
        label: "Component unit",
        data: [603, 884],
        backgroundColor: "rgba(52, 211, 153, 0.85)",
        borderColor: "rgba(52, 211, 153, 1)",
        borderWidth: 1,
      },
      {
        label: "Playwright UI",
        data: [332, 248],
        backgroundColor: "rgba(251, 191, 36, 0.85)",
        borderColor: "rgba(251, 191, 36, 1)",
        borderWidth: 1,
      },
      {
        label: "E2E harness",
        data: [304, 0],
        backgroundColor: "rgba(244, 114, 182, 0.85)",
        borderColor: "rgba(244, 114, 182, 1)",
        borderWidth: 1,
      },
    ],
  },
  options: {
    plugins: {
      ...commonPlugins,
      title: {
        ...commonPlugins.title,
        text: "Test Coverage by Category (lines)",
      },
    },
    scales: {
      x: { ...commonScaleOptions, stacked: true },
      y: { ...commonScaleOptions, stacked: true },
    },
  },
});

// 3. User Corrections by Category
await render("corrections-by-category", {
  type: "bar",
  data: {
    labels: [
      "Testing methodology",
      "Delegation / process",
      "UX feedback",
      "Test organization",
      "Domain knowledge",
    ],
    datasets: [
      {
        label: "Claude Code",
        data: [6, 3, 2, 2, 0],
        backgroundColor: claudeBg,
        borderColor: claude,
        borderWidth: 1,
      },
      {
        label: "Codex",
        data: [0, 3, 0, 0, 1],
        backgroundColor: codexBg,
        borderColor: codex,
        borderWidth: 1,
      },
    ],
  },
  options: {
    indexAxis: "y",
    plugins: {
      ...commonPlugins,
      title: {
        ...commonPlugins.title,
        text: "User Corrections by Category",
      },
    },
    scales: { x: commonScaleOptions, y: commonScaleOptions },
  },
});

// 4. Architecture Radar
await render("architecture-radar", {
  type: "radar",
  data: {
    labels: [
      "DRY / reuse",
      "File size discipline",
      "Decomposition",
      "Constraint separation",
      "Coordinate compactness",
      "Test breadth",
      "Test depth",
      "Accessibility",
      "Methodology contribution",
    ],
    datasets: [
      {
        label: "Claude Code",
        data: [4, 5, 4, 3, 3, 3, 4, 4, 5],
        backgroundColor: "rgba(129, 140, 248, 0.2)",
        borderColor: claude,
        borderWidth: 2,
        pointBackgroundColor: claude,
      },
      {
        label: "Codex",
        data: [2, 3, 2, 5, 4, 4, 3, 4, 3],
        backgroundColor: "rgba(52, 211, 153, 0.2)",
        borderColor: codex,
        borderWidth: 2,
        pointBackgroundColor: codex,
      },
    ],
  },
  options: {
    plugins: {
      ...commonPlugins,
      title: { ...commonPlugins.title, text: "Architecture Comparison" },
    },
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { color: "#a1a1aa", backdropColor: "transparent", stepSize: 1 },
        grid: { color: "rgba(161, 161, 170, 0.2)" },
        angleLines: { color: "rgba(161, 161, 170, 0.2)" },
        pointLabels: { color: "#e4e4e7", font: { size: 11 } },
      },
    },
  },
});

// 5. Session Timelines (horizontal stacked bar / Gantt-style)
const claudePhases = [
  { label: "Delegation battle", start: 0, duration: 8 },
  { label: "Testing methodology", start: 8, duration: 35 },
  { label: "Implementation", start: 43, duration: 46 },
  { label: "User testing + UX", start: 89, duration: 30 },
  { label: "Test discipline", start: 119, duration: 32 },
  { label: "Commit + wrap-up", start: 151, duration: 29 },
];

const codexPhases = [
  { label: "Bootstrap struggles", start: 0, duration: 15 },
  { label: "Feature docs setup", start: 15, duration: 23 },
  { label: "Build + Phase 1", start: 38, duration: 7 },
  { label: "Test harness creation", start: 45, duration: 15 },
  { label: "Phases 2-4 impl", start: 60, duration: 38 },
  { label: "Session end + restart", start: 98, duration: 20 },
  { label: "Final implementation", start: 118, duration: 14 },
];

const phaseColors = [
  "rgba(244, 114, 182, 0.8)",
  "rgba(251, 191, 36, 0.8)",
  "rgba(129, 140, 248, 0.8)",
  "rgba(52, 211, 153, 0.8)",
  "rgba(167, 139, 250, 0.8)",
  "rgba(248, 113, 113, 0.8)",
  "rgba(56, 189, 248, 0.8)",
];

async function renderTimeline(name, title, phases) {
  const labels = phases.map((p) => p.label);
  // Use floating bars: each bar is [start, end]
  const data = phases.map((p) => [p.start, p.start + p.duration]);
  const bgColors = phases.map((_, i) => phaseColors[i % phaseColors.length]);

  await render(name, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: bgColors,
          borderColor: bgColors.map((c) => c.replace("0.8", "1")),
          borderWidth: 1,
          barPercentage: 0.7,
        },
      ],
    },
    options: {
      indexAxis: "y",
      plugins: {
        ...commonPlugins,
        title: { ...commonPlugins.title, text: title },
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const [start, end] = ctx.raw;
              return `${start}–${end} min (${end - start} min)`;
            },
          },
        },
      },
      scales: {
        x: {
          ...commonScaleOptions,
          title: { display: true, text: "Minutes", color: "#a1a1aa" },
          min: 0,
        },
        y: commonScaleOptions,
      },
    },
  });
}

await renderTimeline(
  "timeline-claude",
  "Session Timeline: Claude Code",
  claudePhases
);
await renderTimeline(
  "timeline-codex",
  "Session Timeline: Codex",
  codexPhases
);

// 6. Correction Efficiency
await render("correction-efficiency", {
  type: "bar",
  data: {
    labels: [
      "Corrections",
      "Methodology artifacts",
      "Features beyond spec",
      "Issues filed",
      "Docs created",
    ],
    datasets: [
      {
        label: "Claude Code",
        data: [13, 5, 2, 2, 4],
        backgroundColor: claudeBg,
        borderColor: claude,
        borderWidth: 1,
      },
      {
        label: "Codex",
        data: [8, 2, 0, 0, 2],
        backgroundColor: codexBg,
        borderColor: codex,
        borderWidth: 1,
      },
    ],
  },
  options: {
    plugins: {
      ...commonPlugins,
      title: {
        ...commonPlugins.title,
        text: "Correction Efficiency: Inputs vs Outputs",
      },
    },
    scales: { x: commonScaleOptions, y: commonScaleOptions },
  },
});

// 7. Code Quality Scorecard
await render("code-quality", {
  type: "bar",
  data: {
    labels: [
      "as Type casts",
      "DRY violations",
      "Hardcoded pixels",
      "Listener leak risk",
      "Shared drag hook",
    ],
    datasets: [
      {
        label: "Claude Code",
        data: [4, 3, 1, 1, 1],
        backgroundColor: claudeBg,
        borderColor: claude,
        borderWidth: 1,
      },
      {
        label: "Codex",
        data: [6, 4, 1, 3, 0],
        backgroundColor: codexBg,
        borderColor: codex,
        borderWidth: 1,
      },
    ],
  },
  options: {
    indexAxis: "y",
    plugins: {
      ...commonPlugins,
      title: { ...commonPlugins.title, text: "Code Quality Scorecard" },
    },
    scales: { x: commonScaleOptions, y: commonScaleOptions },
  },
});

console.log("done");
