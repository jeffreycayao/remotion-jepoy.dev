// Jepoy.dev branding for the terminal launcher (palette, logo, layout).
// Follows the Jepoy.dev Brand Manual: cream canvas, charcoal text, one restrained lime accent,
// olive for decorative lines. Lime is never used for small text on cream.
import os from "node:os";

export const BRAND = {
  cream: "#F6F1E6",
  charcoal: "#27231B",
  lime: "#D5FA00",
  olive: "#687323",
  blue: "#BFD0EF",
  ink: "#5A5447", // muted charcoal for secondary text on cream (7:1 contrast)
};

// ── color support ─────────────────────────────────────────────────────────
const tty = process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== "dumb";
const truecolor =
  /truecolor|24bit/i.test(process.env.COLORTERM ?? "") ||
  Boolean(process.env.WT_SESSION) || // Windows Terminal
  ["iTerm.app", "vscode", "WezTerm", "Hyper", "ghostty"].includes(process.env.TERM_PROGRAM) ||
  (process.platform === "win32" && Number(os.release().split(".")[2] ?? 0) >= 14931); // Win10 1703+ console
// PROMO_COLOR=24bit|256|plain overrides detection (testing, or a terminal that misreports itself).
export const MODE = ["24bit", "256", "plain"].includes(process.env.PROMO_COLOR) ? process.env.PROMO_COLOR : !tty ? "plain" : truecolor ? "24bit" : "256"; // macOS Terminal.app → 256

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const to256 = ([r, g, b]) => {
  const q = (v) => (v < 48 ? 0 : v < 115 ? 1 : Math.round((v - 35) / 40));
  const lvl = [0, 95, 135, 175, 215, 255];
  const [qr, qg, qb] = [q(r), q(g), q(b)];
  const cube = 16 + 36 * qr + 6 * qg + qb;
  const dc = (lvl[qr] - r) ** 2 + (lvl[qg] - g) ** 2 + (lvl[qb] - b) ** 2;
  const gi = Math.max(0, Math.min(23, Math.round(((r + g + b) / 3 - 8) / 10)));
  const gv = 8 + gi * 10;
  return dc <= (gv - r) ** 2 + (gv - g) ** 2 + (gv - b) ** 2 ? cube : 232 + gi;
};
const sgr = (s) => (MODE === "plain" ? "" : `\x1b[${s}m`);
const fg = (hex) => (MODE === "24bit" ? sgr(`38;2;${rgb(hex).join(";")}`) : sgr(`38;5;${to256(rgb(hex))}`));
const bg = (hex) => (MODE === "24bit" ? sgr(`48;2;${rgb(hex).join(";")}`) : sgr(`48;5;${to256(rgb(hex))}`));

/** Canvas default: charcoal on cream. Every styled span returns to it (a plain reset would drop the cream). */
const BASE = MODE === "plain" ? "" : sgr(0) + bg(BRAND.cream) + fg(BRAND.charcoal);
const span = (text, { color, fill, bold } = {}) =>
  MODE === "plain" ? text : `${bold ? sgr(1) : ""}${color ? fg(color) : ""}${fill ? bg(fill) : ""}${text}${BASE}`;
const visible = (s) => s.replace(/\x1b\[[0-9;]*m/g, "").length;

// ── logo ─────────────────────────────────────────────────────────────────
// J monogram, sampled from the approved "Solid charcoal J monogram" file into the brand palette
// (C charcoal tile, W cream J, L lime slash, . transparent). Drawn two pixels per cell with ▀.
const MONO = [
  "..CCCCCCCCCCCC..",
  ".CCCCCCCCCCCCCC.",
  "CCCCCCCCCCCCCLCC",
  "CCCCCCWWWWCCLLCC",
  "CCCCCCCCCWWCLCCC",
  "CCCCCCCCCWWWCCCC",
  "CCCCCCCCCWWCCCCC",
  "CCCCCCCCCWWCCCCC",
  "CCCCCCCCCWWCCCCC",
  "CCCCCCCCCWWCCCCC",
  "CCCCWWCCCWWCCCCC",
  "CCCCWWWCWWWCCCCC",
  "CCCCWWWWWWCCCCCC",
  "CCCCCCWWWCCCCCCC",
  ".CCCCCCCCCCCCCC.",
  "..CCCCCCCCCCCC..",
];
const PX = { C: BRAND.charcoal, W: BRAND.cream, L: BRAND.lime, ".": BRAND.cream };
const monogramRows = () => {
  const rows = [];
  for (let y = 0; y < MONO.length; y += 2) {
    let line = "";
    for (let x = 0; x < MONO[y].length; x++) {
      const top = PX[MONO[y][x]];
      const bot = PX[MONO[y + 1][x]];
      line += top === bot ? span(" ", { fill: top }) : span("▀", { color: top, fill: bot });
    }
    rows.push(line);
  }
  return rows; // 16 columns × 8 rows
};

// JEPOY.DEV wordmark in a 5-row block face (terminal stand-in for the approved lockup).
const GLYPHS = {
  J: ["     ██ ", "     ██ ", "     ██ ", "██   ██ ", " █████  "],
  E: ["███████ ", "██      ", "█████   ", "██      ", "███████ "],
  P: ["██████  ", "██   ██ ", "██████  ", "██      ", "██      "],
  O: [" ██████  ", "██    ██ ", "██    ██ ", "██    ██ ", " ██████  "],
  Y: ["██    ██ ", " ██  ██  ", "  ████   ", "   ██    ", "   ██    "],
  ".": ["   ", "   ", "   ", "   ", "██ "],
  D: ["██████  ", "██   ██ ", "██   ██ ", "██   ██ ", "██████  "],
  V: ["██    ██ ", "██    ██ ", "██    ██ ", " ██  ██  ", "  ████   "],
};
const word = (text) => [0, 1, 2, 3, 4].map((r) => [...text].map((ch) => GLYPHS[ch][r]).join(""));
const JEPOY = word("JEPOY.");
const DEV = word("DEV");
export const WORDMARK_WIDTH = JEPOY[0].length + DEV[0].length;

// ── screen helpers ─────────────────────────────────────────────────────────
const cols = () => Math.max(40, (process.stdout.columns || 100) - 1); // -1 avoids auto-wrap on the last column

/** Paint the whole terminal cream (clearing with a background colour fills the window). */
export const openCanvas = () => {
  if (MODE === "plain") return process.stdout.write("\n");
  process.stdout.write(`\x1b]0;Promo Studio · Jepoy.dev\x07${BASE}\x1b[2J\x1b[3J\x1b[H`);
};
/** Back to the terminal's own colours (before running an action, and on exit). */
export const closeCanvas = (clear = true) => {
  if (MODE === "plain") return;
  process.stdout.write(sgr(0) + (clear ? "\x1b[2J\x1b[3J\x1b[H" : ""));
};
const line = (content = "") => process.stdout.write(`${BASE}  ${content}${" ".repeat(Math.max(0, cols() - 2 - visible(content)))}${BASE}\n`);

export const ui = {
  key: (k) => span(` ${k} `, { fill: BRAND.lime, color: BRAND.charcoal, bold: true }),
  muted: (s) => span(s, { color: BRAND.ink }),
  bold: (s) => span(s, { bold: true }),
  eyebrow: (s) => span(s.toUpperCase().split("").join(" "), { color: BRAND.olive, bold: true }),
  rule: (w) => span("─".repeat(Math.max(0, w - 2)), { color: BRAND.olive }) + span(" ▪", { color: BRAND.blue }),
  prompt: () => (MODE === "plain" ? "  > " : `  ${span(" ❯ ", { fill: BRAND.charcoal, color: BRAND.lime, bold: true })} ${BASE}`),
};

/**
 * Home screen: logo lockup, grouped menu, status, ownership footer.
 * groups: [{ title, items: [[key, label]] }], status: [[label, value]], meta: { version, platform }
 */
export const renderHome = ({ groups, status, meta }) => {
  const W = cols();
  openCanvas();
  line();

  // Header — monogram + JEPOY.DEV with the lime underline under DEV, as in the approved lockup.
  // The full home screen is ~29 rows; in shorter windows use a one-line header so nothing scrolls away.
  const tall = (process.stdout.rows || 40) >= 30;
  const full = tall && W >= 4 + 16 + 3 + WORDMARK_WIDTH && MODE !== "plain";
  const mid = tall && W >= 4 + WORDMARK_WIDTH && MODE !== "plain";
  const title = `${ui.bold("PROMO STUDIO")}   ${ui.muted("Build it. Ship it.")}`;
  if (full || mid) {
    const mono = full ? monogramRows() : null;
    const gap = full ? "   " : "";
    const underline = " ".repeat(JEPOY[0].length) + span("▀".repeat(DEV[0].length - 1), { color: BRAND.lime });
    const right = ["", ...JEPOY.map((r, i) => r + DEV[i]), underline, title];
    for (let i = 0; i < right.length; i++) line(`${mono ? mono[i] ?? " ".repeat(16) : ""}${gap}${right[i]}`);
  } else {
    line(`${ui.bold("JEPOY.DEV")}  ${ui.muted("·")}  ${title}`);
  }
  line();
  line(ui.rule(W - 2));
  line(`${ui.muted("App promo video factory")}   ${span("Code • AI • Automation", { color: BRAND.olive })}`);
  line();

  // Menu — grouped by what you're doing; columns when there's room, stacked otherwise.
  const colW = 30;
  const perRow = Math.max(1, Math.min(groups.length, Math.floor((W - 2) / colW)));
  for (let g = 0; g < groups.length; g += perRow) {
    const band = groups.slice(g, g + perRow);
    const height = Math.max(...band.map((b) => b.items.length));
    const cell = (s, w) => s + " ".repeat(Math.max(0, w - visible(s)));
    line(band.map((b) => cell(ui.eyebrow(b.title), colW)).join(""));
    for (let r = 0; r < height; r++) {
      // items are [key, action, label] (or [key, label]) — show the label
      line(band.map((b) => cell(b.items[r] ? `${ui.key(b.items[r][0])} ${b.items[r].at(-1)}` : "", colW)).join(""));
    }
    line();
  }

  // Status
  line(ui.rule(W - 2));
  for (const [label, value] of status) line(`${cellLabel(label)}${value}`);
  line();
  // Ownership footer
  const left = `${span("©", { color: BRAND.ink })} ${new Date().getFullYear()} ${ui.bold("Jepoy.dev")} ${ui.muted(`· Jeffrey Cayao · Promo Studio v${meta.version} · ${meta.platform}`)}`;
  const exit = `${ui.key("0")} Exit`;
  line(left + " ".repeat(Math.max(2, W - 2 - visible(left) - visible(exit))) + exit);
  line();
};
const cellLabel = (label) => {
  const s = ui.eyebrow(label);
  return s + " ".repeat(Math.max(1, 22 - visible(s)));
};

/** Header strip for action screens (on the terminal's own colours, so tool output stays readable). */
export const actionHeader = (title) => {
  closeCanvas();
  if (MODE === "plain") return console.log(`\n== JEPOY.DEV · Promo Studio › ${title} ==\n`);
  const W = cols();
  const text = ` ${span("J", { color: BRAND.cream, fill: BRAND.charcoal, bold: true })}${span("▀", { color: BRAND.lime, fill: BRAND.charcoal })} JEPOY.DEV  │  Promo Studio  ${span("›", { color: BRAND.lime, fill: BRAND.charcoal, bold: true })}  ${title}`;
  // Draw the strip charcoal-on-cream-inverted: charcoal bar, cream text, one lime accent.
  const bar = text.split(BASE).join(sgr(0) + bg(BRAND.charcoal) + fg(BRAND.cream));
  process.stdout.write(`\n${bg(BRAND.charcoal)}${fg(BRAND.cream)}${bar}${" ".repeat(Math.max(0, W - visible(text)))}${sgr(0)}\n`);
  process.stdout.write(`${fg(BRAND.lime)}${"▀".repeat(Math.min(W, 12))}${sgr(0)}\n\n`);
};

export const goodbye = () => {
  closeCanvas();
  console.log(MODE === "plain" ? "\nBuild it. Ship it. · Jepoy.dev\n" : `\n  ${fg(BRAND.lime)}▀▀${sgr(0)} Build it. Ship it.  ${sgr(2)}· Jepoy.dev Promo Studio${sgr(0)}\n`);
};
