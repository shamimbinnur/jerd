import chalk from "chalk";
import ora from "ora";
import gradient from "gradient-string";
import boxen from "boxen";
import figlet from "figlet";

export function welcomeBanner() {
  const asciiArt = figlet.textSync("JERD", {
    font: "Slant",
    horizontalLayout: "default",
  });
  const title = gradient.pastel.multiline(asciiArt);
  console.log("\n" + title);
  console.log(chalk.dim("📖 Write. Reflect. Commit.\n"));
}

export function successMessage(text) {
  console.log(chalk.green("✓") + " " + text);
}

export function errorMessage(text) {
  console.error(chalk.red("✗") + " " + chalk.red(text));
}

export function infoMessage(text) {
  console.log(chalk.blue("ℹ") + " " + chalk.blue(text));
}

export function warningMessage(text) {
  console.log(chalk.yellow("⚠") + " " + chalk.yellow(text));
}

export function createSpinner(text) {
  return ora({
    text,
    color: "cyan",
    spinner: "dots",
  });
}

export function boxMessage(text, options = {}) {
  const defaultOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green",
    ...options,
  };
  console.log(boxen(text, defaultOptions));
}

export function gradientTitle(text) {
  const asciiArt = figlet.textSync(text, {
    font: "Slant",
    horizontalLayout: "default",
  });
  return gradient.pastel.multiline(asciiArt);
}

export function dimText(text) {
  return chalk.dim(text);
}

export function boldText(text) {
  return chalk.bold(text);
}

export function cyanText(text) {
  return chalk.cyan(text);
}
