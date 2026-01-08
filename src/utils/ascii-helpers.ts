// Box Drawing Characters
export const BOX = {
  // Single line
  topLeft: "┌",
  topRight: "┐",
  bottomLeft: "└",
  bottomRight: "┘",
  horizontal: "─",
  vertical: "│",

  // T-junctions
  teeRight: "├",
  teeLeft: "┤",
  teeDown: "┬",
  teeUp: "┴",
  cross: "┼",

  // Double line
  dTopLeft: "╔",
  dTopRight: "╗",
  dBottomLeft: "╚",
  dBottomRight: "╝",
  dHorizontal: "═",
  dVertical: "║",

  // Arrows
  arrowRight: "▶",
  arrowLeft: "◀",
  arrowUp: "▲",
  arrowDown: "▼",
  arrowLineRight: "─▶",
  arrowLineLeft: "◀─",
} as const;

// Status Indicators
export const STATUS_ICONS = {
  idle: "○",
  thinking: "◐",
  working: "◉",
  error: "✖",
  waiting: "◔",
  success: "✔",
  warning: "⚠",
} as const;

// Spinner Frames
export const SPINNER_FRAMES = ["◐", "◓", "◑", "◒"] as const;

// ASCII Robot Avatars
export const AVATARS = {
  robot1: `
 ╭──────╮
 │ ◉  ◉ │
 │  ──  │
 │ ╰──╯ │
 ╰──────╯
   ││││
`.trim(),

  robot2: `
 ┌─────┐
 │[◉ ◉]│
 │ ─── │
 │ ▀▀▀ │
 └─┬─┬─┘
   │ │
`.trim(),

  robot3: `
  ╔═══╗
  ║◯ ◯║
  ║ ▬ ║
  ╠═══╣
  ║   ║
  ╚═══╝
`.trim(),

  robot4: `
 ▄▄▄▄▄▄
 █◉  ◉█
 █ ── █
 █▀▀▀▀█
 ▀▀▀▀▀▀
`.trim(),

  agent: `
   ◢██◣
  █◉◉█
   ████
   ▀▀
`.trim(),

  user: `
   ●
  /|\\
   |
  / \\
`.trim(),

  system: `
 ╔═══╗
 ║ ⚙ ║
 ╚═══╝
`.trim(),

  minimal: `
 [◉]
`.trim(),
} as const;

// Header ASCII Art
export const HEADER_ART = `
╔═══════════════════════════════════════════════════════════════════╗
║     ░█▀▀░█▀▀░█▀▀░▀█▀░▀█▀░░░░█▀█░█▀▀░█▀▀░█▀█░▀█▀░█▀▀                ║
║     ░█▀▀░▀▀█░█░░░░█░░░█░░░░░█▀█░█░█░█▀▀░█░█░░█░░▀▀█                ║
║     ░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░░░░▀░▀░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀                ║
║                                                                     ║
║          █ A G E N T I C   A I   V I S U A L I Z E R █             ║
╚═══════════════════════════════════════════════════════════════════╝
`.trim();

// Compact Header
export const HEADER_COMPACT = `
┌─────────────────────────────────────────────────┐
│  ASCII AGENTS  ◉  Status: LIVE  ◉  v1.0.0      │
└─────────────────────────────────────────────────┘
`.trim();

// Create a bordered box
export function createBox(
  content: string,
  options: {
    title?: string;
    width?: number;
    padding?: number;
    double?: boolean;
  } = {},
): string {
  const { title, width = 40, padding = 1, double = false } = options;

  const chars = double
    ? { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" }
    : { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" };

  const innerWidth = width - 2;
  const paddingStr = " ".repeat(padding);

  const lines = content.split("\n");
  const paddedLines = lines.map((line) => {
    const trimmed = line.slice(0, innerWidth - padding * 2);
    return `${chars.v}${paddingStr}${trimmed.padEnd(innerWidth - padding * 2)}${paddingStr}${chars.v}`;
  });

  let topLine = chars.tl + chars.h.repeat(innerWidth) + chars.tr;
  if (title) {
    const titleText = ` ${title} `;
    const titleStart = Math.floor((innerWidth - titleText.length) / 2);
    topLine =
      chars.tl +
      chars.h.repeat(titleStart) +
      titleText +
      chars.h.repeat(innerWidth - titleStart - titleText.length) +
      chars.tr;
  }

  const bottomLine = chars.bl + chars.h.repeat(innerWidth) + chars.br;

  return [topLine, ...paddedLines, bottomLine].join("\n");
}

// Create a horizontal divider
export function createDivider(width: number, char: string = "─"): string {
  return char.repeat(width);
}

// Format a status indicator
export function formatStatus(
  status: keyof typeof STATUS_ICONS,
  text?: string,
): string {
  const icon = STATUS_ICONS[status];
  return text ? `${icon} ${text}` : icon;
}

// Create a progress bar
export function createProgressBar(
  progress: number,
  width: number = 20,
): string {
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${progress}%`;
}

// Format bytes/tokens
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

// Format cost
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

// Format timestamp
export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Create connecting lines between elements
export function createConnectionLine(
  length: number,
  hasArrow: boolean = true,
): string {
  const line = "─".repeat(length - (hasArrow ? 1 : 0));
  return hasArrow ? line + "▶" : line;
}
