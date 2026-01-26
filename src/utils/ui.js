import chalk from "chalk";
import ora from "ora";
import gradient from "gradient-string";
import boxen from "boxen";
import figlet from "figlet";

import { getTheme } from "./theme.js";

let currentTheme = getTheme('cozy');
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
  console.log(C().success(currentTheme.icons.success) + " " + C().success(text));
}

export function errorMessage(text) {
  console.error(C().error(currentTheme.icons.error) + " " + C().error(text));
}

export function infoMessage(text) {
  console.log(C().info(currentTheme.icons.info) + " " + C().info(text));
}

export function warningMessage(text) {
  console.log(C().warning(currentTheme.icons.warning) + " " + C().warning(text));
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
  console.log(`${C().muted(currentTheme.icons.treeVertical)} ${stepText} ${C().text(text)}`);
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
  console.log(`\n${gradient(C().gradient)('✨ 🌟 ✨ 🌟 ✨')}\n`);
}

export function gentleHint(text) {
  console.log(`\n${C().muted(currentTheme.icons.hint || '💡')} ${C().info(text)}\n`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function landingScreen() {
  const headline = C().accentBold("Terminal-first journaling.");
  const quickStart = [
    `${C().muted("🧪 First time?")} ${C().info("jerd init")}  ${C().text("Set up your journal")}`,
    `${C().muted("✍️  Jump in:")}   ${C().info("jerd new")}   ${C().text("Create today's entry")}`,
    `${C().muted("🗂️  Browse:")}    ${C().info("jerd list")}  ${C().text("See entries by month")}`,
    `${C().muted("📊 Reflect:")}   ${C().info("jerd mood")}  ${C().text("View mood trends")}`,
    `${C().muted("🔥 Streak:")}    ${C().info("jerd streak")} ${C().text("Keep the habit going")}`,
  ].join("\n");

  const footer = C().muted("Run `jerd --help` for all commands.");

  console.log("\n" + gradientTitle("JERD"));
  const sparkleFrames = [
    "✨       ",
    "  ✨     ",
    "    ✨   ",
    "      ✨ ",
    "    ✨   ",
    "  ✨     ",
  ];

  for (const frame of sparkleFrames) {
    process.stdout.write(gradient(C().gradient)(` ${frame}`) + "\r");
    await sleep(80);
  }
  process.stdout.write(" \r");
  console.log("");

  console.log(
    boxen(`${headline}\n\n${quickStart}\n\n${footer}`, {
      padding: 1,
      margin: currentTheme.styles.margin,
      borderStyle: currentTheme.styles.borderStyle,
      borderColor: currentTheme.colors.border,
    }),
  );
}

export function notInitializedBanner() {
  const content = [
    `${C().warning(currentTheme.icons.warning)}  ${chalk.hex('#ef4444').bold('Not a jerd project')}`,
    '',
    `${C().muted('Run')} ${C().info('jerd init')} ${C().muted('to get started')}`,
  ].join('\n');

  console.log(
    boxen(content, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      margin: currentTheme.styles.margin,
      borderStyle: currentTheme.styles.borderStyle,
      borderColor: currentTheme.colors.warning(currentTheme.icons.warning) ? currentTheme.colors.border : '#f59e0b', // fallback
    })
  );
}
