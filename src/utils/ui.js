import chalk from "chalk";
import ora from "ora";
import gradient from "gradient-string";
import boxen from "boxen";
import figlet from "figlet";
import dayjs from "dayjs";

import { getTheme } from "./theme.js";
import { getJerdPath, fileExists } from "./file-system.js";
import { collectActivityData } from "./streak-chart.js";

let currentTheme = getTheme("cozy");
export { currentTheme };

export function setTheme(themeName) {
  currentTheme = getTheme(themeName);
}

// Helper to access current palette
const C = () => currentTheme.colors;

export function welcomeBanner() {
  console.log("\n" + gradientTitle("JERD"));
  console.log(C().accent("✨ Ready to journal? Let's make it cozy."));
  console.log(C().muted("📖 Write. Reflect. Commit.\n"));
}

export function successMessage(text) {
  console.log(
    C().success(currentTheme.icons.success) + " " + C().success(text),
  );
}

export function errorMessage(text) {
  console.error(C().error(currentTheme.icons.error) + " " + C().error(text));
}

export function infoMessage(text) {
  console.log(C().info(currentTheme.icons.info) + " " + C().info(text));
}

export function warningMessage(text) {
  console.log(
    C().warning(currentTheme.icons.warning) + " " + C().warning(text),
  );
}

export function createSpinner(text) {
  return ora({
    text,
    color: "magenta",
    spinner: "dots",
  });
}

export function boxMessage(text, options = {}) {
  const defaultOptions = {
    padding: 1,
    margin: currentTheme.styles.margin,
    borderStyle: currentTheme.styles.borderStyle,
    borderColor: currentTheme.colors.border,
    ...options,
  };
  console.log(boxen(text, defaultOptions));
}

export function gradientTitle(text) {
  const asciiArt = figlet.textSync(text, {
    font: "ANSI Shadow",
    horizontalLayout: "default",
  });
  return gradient(C().softGradient).multiline(asciiArt);
}

export function dimText(text) {
  return C().muted(text);
}

export function boldText(text) {
  return C().primaryBold(text);
}

export function cyanText(text) {
  return C().info(text);
}

export function softHeader(text) {
  // Simple accent header for now, relying on boxen in other places, or just colored text
  console.log(`\n${C().primaryBold(text)}\n`);
}

export function stepLine(step, total, text) {
  const stepText = C().accent(`Step ${step}/${total}`);
  console.log(
    `${C().muted(currentTheme.icons.treeVertical)} ${stepText} ${C().text(text)}`,
  );
}

export function cozyBox(text, options = {}) {
  const defaultOptions = {
    padding: 1,
    margin: currentTheme.styles.margin,
    borderStyle: currentTheme.styles.borderStyle,
    borderColor: currentTheme.colors.border,
    backgroundColor: C().bg ? undefined : undefined, // bgHex not easily extracted from chalk, ignoring for simple box
    ...options,
  };
  console.log(boxen(text, defaultOptions));
}

export function celebrationLine() {
  console.log(`\n${gradient(C().gradient)("✨ 🌟 ✨ 🌟 ✨")}\n`);
}

export function gentleHint(text) {
  console.log(
    `\n${C().muted(currentTheme.icons.hint || "💡")} ${C().info(text)}\n`,
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Inspirational quotes for journaling
const INSPIRATIONAL_QUOTES = [
  "Write what should not be forgotten.",
  "The pages of a journal are the pages of your life.",
  "Today's thoughts are tomorrow's memories.",
  "In writing, we discover what we truly think.",
  "A journal is your conversation with yourself.",
  "Record your journey, celebrate your growth.",
  "Every entry is a step toward self-understanding.",
  "Your story matters. Write it down."
];

function getRandomQuote() {
  return INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
}

// Enhanced sparkle animation with more frames
const SPARKLE_FRAMES = [
  "✨       ",
  "  ✨     ",
  "    ✨   ",
  "      ✨ ",
  "    ✨   ",
  "  ✨     ",
  "✨       ",
  "  ✨   ✨ ",
  " ✨ ✨ ✨ ",
  "✨✨✨✨✨"
];

export async function landingScreen(context = {}) {
  const { config = null } = context;

  const todayLine = C().muted(dayjs().format("dddd, MMMM D, YYYY"));
  const greeting = getGreeting();
  const inspirationalQuote = C().accent(`"${getRandomQuote()}"`);

  // Detect whether a Jerd journal exists in/above this folder
  const jerdPath = getJerdPath();
  const hasJerdFolder = await fileExists(jerdPath);
  const initialized = !!config && hasJerdFolder;

  // Get journal statistics if initialized
  let stats = null;
  if (initialized) {
    stats = await getJournalStats(jerdPath);
  }

  let statusLine = "";
  if (!initialized) {
    statusLine = `${C().warning("No journal here.")} ${C().muted(
      "Run",
    )} ${C().info("jerd init")} ${C().muted("to begin your journey.")}`;
  } else {
    const editor = config.editor || "nano";
    const template = config.defaultTemplate || "default";
    const theme = config.theme || "cozy";
    statusLine = `${C().success("Journal ready.")} ${C().muted(
      "Editor:",
    )} ${C().info(editor)}  ${C().muted("Template:")} ${C().info(
      template,
    )}  ${C().muted("Theme:")} ${C().info(theme)}`;
  }

  const actions = initialized
    ? [
        { cmd: "jerd new", desc: "write today's entry", icon: "✍️" },
        { cmd: "jerd open yesterday", desc: "continue yesterday's thoughts", icon: "📖" },
        { cmd: "jerd list", desc: "browse all entries", icon: "📋" },
        { cmd: "jerd mood", desc: "view emotional patterns", icon: "📊" },
        { cmd: "jerd streak", desc: "track writing consistency", icon: "🔥" },
        { cmd: "jerd config", desc: "personalize settings", icon: "⚙️" },
      ]
    : [
        { cmd: "jerd init", desc: "create your journal space", icon: "🚀" },
        { cmd: "jerd new", desc: "write your first entry", icon: "✨" },
        { cmd: "jerd config", desc: "set preferences", icon: "⚙️" },
      ];

  const maxCmd = actions.reduce((max, a) => Math.max(max, a.cmd.length), 0);
  const actionLines = actions.map(
    (a) => `${a.icon} ${C().info(a.cmd.padEnd(maxCmd + 2))}${C().muted(`- ${a.desc}`)}`,
  );

  const footer = `${C().muted("Run")} ${C().info(
    "jerd --help",
  )} ${C().muted("for complete command reference.")}`;

  // Enhanced sparkle animation
  for (const frame of SPARKLE_FRAMES) {
    process.stdout.write(gradient(C().gradient)(` ${frame}`) + "\r");
    await sleep(60);
  }
  process.stdout.write(" \r");
  console.log("");

  const pathLine = C().muted(`📂 ${jerdPath}`);
  const quickLabel = C().accentBold("Quick actions");
  const tipLine = initialized
    ? C().muted("💡 Tip: Personalize your experience with ") + C().info("jerd config --theme")
    : C().muted("💡 Tip: Start your journaling journey with ") + C().info("jerd init .");

  const boxContent = [
    gradientTitle("JERD"),
    "",
    `${greeting} • ${todayLine}`,
    "",
    pathLine,
    "",
    statusLine,
    ...(stats ? ["", getStatsDisplay(stats)] : []),
    "",
    `┌─ ${C().accentBold("Inspiration")} ─┐`,
    `│ ${inspirationalQuote.padEnd(34)} │`,
    `└────────────────────────────┘`,
    "",
    `${C().accentBold("Quick actions")}`,
    ...actionLines.map((a) => `  ${a}`),
    "",
    tipLine,
    "",
    C().muted("─".repeat(40)),
    footer,
  ].join("\n");

  console.log(
    boxen(boxContent, {
      padding: 1,
      margin: currentTheme.styles.margin,
      borderStyle: currentTheme.styles.borderStyle,
      borderColor: currentTheme.colors.border,
    }),
  );
}

function getGreeting() {
  const hour = dayjs().hour();
  let greeting = "";
  let emoji = "";
  
  if (hour < 12) {
    greeting = "Good morning";
    emoji = "🌅";
  } else if (hour < 17) {
    greeting = "Good afternoon";
    emoji = "☀️";
  } else {
    greeting = "Good evening";
    emoji = "🌙";
  }
  
  return C().accentBold(`${emoji} ${greeting}, writer.`);
}

async function getJournalStats(jerdPath) {
  try {
    const endDate = dayjs();
    const startDate = endDate.subtract(30, 'day');
    const activityData = await collectActivityData(startDate, endDate, jerdPath, fileExists);
    
    const totalEntries = activityData.filter(e => e.exists).length;
    const currentStreak = getCurrentStreak(activityData);
    
    return {
      entriesThisMonth: totalEntries,
      currentStreak,
      consistency: Math.round((totalEntries / 30) * 100)
    };
  } catch (error) {
    return null;
  }
}

function getCurrentStreak(activityData) {
  let streak = 0;
  for (let i = activityData.length - 1; i >= 0; i--) {
    if (activityData[i].exists) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getStatsDisplay(stats) {
  const parts = [];
  
  if (stats.currentStreak > 0) {
    parts.push(`${C().success("🔥 " + stats.currentStreak + " day streak")}`);
  }
  
  if (stats.entriesThisMonth > 0) {
    parts.push(`${C().info("📝 " + stats.entriesThisMonth + " entries this month")}`);
  }
  
  if (stats.consistency > 0) {
    parts.push(`${C().accent("📈 " + stats.consistency + "% consistency")}`);
  }
  
  return parts.length > 0 ? parts.join("  ") : "";
}

export function notInitializedBanner() {
  const content = [
    `${C().warning(currentTheme.icons.warning)}  ${chalk.hex("#ef4444").bold("Not a jerd project")}`,
    "",
    `${C().muted("Run")} ${C().info("jerd init")} ${C().muted("to get started")}`,
  ].join("\n");

  console.log(
    boxen(content, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      margin: currentTheme.styles.margin,
      borderStyle: currentTheme.styles.borderStyle,
      borderColor: currentTheme.colors.warning(currentTheme.icons.warning)
        ? currentTheme.colors.border
        : "#f59e0b", // fallback
    }),
  );
}
