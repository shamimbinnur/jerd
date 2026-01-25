import chalk from "chalk";
import ora from "ora";
import gradient from "gradient-string";
import boxen from "boxen";
import figlet from "figlet";

// Astro-style cozy palette
const COZY_PALETTE = {
  primary: chalk.hex('#8b5cf6'), // soft purple
  primaryBold: chalk.hex('#8b5cf6').bold,
  accent: chalk.hex('#f59e0b'), // warm amber
  accentBold: chalk.hex('#f59e0b').bold,
  success: chalk.hex('#10b981'), // gentle green
  info: chalk.hex('#3b82f6'), // calm blue
  warning: chalk.hex('#f59e0b'), // soft amber
  error: chalk.hex('#ef4444'), // gentle red
  muted: chalk.hex('#6b7280'), // soft gray
  text: chalk.hex('#374151'), // warm dark gray
  gradient: gradient(['#8b5cf6', '#ec4899', '#f59e0b']), // purple-pink-amber
  softGradient: gradient(['#a78bfa', '#fbbf24']), // light purple-amber
};

export function welcomeBanner() {
  const asciiArt = figlet.textSync("JERD", {
    font: "Slant",
    horizontalLayout: "default",
  });
  const title = COZY_PALETTE.gradient.multiline(asciiArt);
  console.log("\n" + title);
  console.log(COZY_PALETTE.accent("✨ Ready to journal? Let's make it cozy."));
  console.log(COZY_PALETTE.muted("📖 Write. Reflect. Commit.\n"));
}

export function successMessage(text) {
  console.log(COZY_PALETTE.success("✅") + " " + COZY_PALETTE.success(text));
}

export function errorMessage(text) {
  console.error(COZY_PALETTE.error("💥") + " " + COZY_PALETTE.error(text));
}

export function infoMessage(text) {
  console.log(COZY_PALETTE.info("🧭") + " " + COZY_PALETTE.info(text));
}

export function warningMessage(text) {
  console.log(COZY_PALETTE.warning("⚠️") + " " + COZY_PALETTE.warning(text));
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
    margin: 1,
    borderStyle: "round",
    borderColor: "magenta",
    ...options,
  };
  console.log(boxen(text, defaultOptions));
}

export function gradientTitle(text) {
  const asciiArt = figlet.textSync(text, {
    font: "Slant",
    horizontalLayout: "default",
  });
  return COZY_PALETTE.softGradient.multiline(asciiArt);
}

export function dimText(text) {
  return COZY_PALETTE.muted(text);
}

export function boldText(text) {
  return COZY_PALETTE.primaryBold(text);
}

export function cyanText(text) {
  return COZY_PALETTE.info(text);
}

// Astro-style cozy helpers
export function softHeader(text) {
  console.log(`\n${COZY_PALETTE.primary('┌─────────────────────────────────────┐')}`);
  console.log(`${COZY_PALETTE.primary('│')} ${COZY_PALETTE.accentBold(text.padEnd(36))}${COZY_PALETTE.primary('│')}`);
  console.log(`${COZY_PALETTE.primary('└─────────────────────────────────────┘')}\n`);
}

export function stepLine(step, total, text) {
  const stepText = COZY_PALETTE.accent(`Step ${step}/${total}`);
  console.log(`${COZY_PALETTE.muted('│')} ${stepText} ${COZY_PALETTE.text(text)}`);
}

export function cozyBox(text, options = {}) {
  const defaultOptions = {
    padding: 1,
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderStyle: "round",
    borderColor: "magenta",
    backgroundColor: "#f9fafb",
    ...options,
  };
  console.log(boxen(text, defaultOptions));
}

export function celebrationLine() {
  console.log(`\n${COZY_PALETTE.gradient('✨ 🌟 ✨ 🌟 ✨')}\n`);
}

export function gentleHint(text) {
  console.log(`\n${COZY_PALETTE.muted('💡')} ${COZY_PALETTE.info(text)}\n`);
}
