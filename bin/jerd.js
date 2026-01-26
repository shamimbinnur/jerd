#!/usr/bin/env node

import { Command } from "commander";
import initCommand from "../src/commands/init.js";
import newCommand from "../src/commands/new.js";
import openCommand from "../src/commands/open.js";
import configCommand from "../src/commands/config.js";
import listCommand from "../src/commands/list.js";
import moodCommand from "../src/commands/mood.js";
import delCommand from "../src/commands/del.js";
import streakCommand from "../src/commands/streak.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { gradientTitle, dimText, landingScreen, setTheme } from "../src/utils/ui.js";
import { loadConfig } from "../src/utils/jerd.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

const program = new Command();

program
  .name("jerd")
  .description(
    dimText(
      "📖 A terminal-first journaling tool that syncs just fine with your favourite editors — Vim to VS Code",
    ),
  )
  .version(packageJson.version, "-v, --version", "Display version number")
  .addHelpText("beforeAll", () => {
    return gradientTitle("JERD") + "\n";
  });

program
  .command("init [path]")
  .description("🚀 Initialize Jerd project")
  .action(async (path) => {
    try {
      await initCommand(path);
    } catch (error) {
      console.error("Error during init:", error.message);
      process.exit(1);
    }
  });

program
  .command("new [date...]")
  .description("✍️  Create journal entry (supports flexible date formats)")
  .option("-t, --template <name>", "Template to use (overrides config)")
  .option("-e, --editor <name>", "Editor to use (overrides config)")
  .action(async (dateArgs, options) => {
    // Join date arguments into a single string (e.g., "jan 4" instead of ["jan", "4"])
    const dateArg =
      dateArgs && dateArgs.length > 0 ? dateArgs.join(" ") : undefined;
    try {
      await newCommand(dateArg, options);
    } catch (error) {
      console.error("Error during new:", error.message);
      process.exit(1);
    }
  });

program
  .command("open [date...]")
  .description(
    "📖 Open existing journal entry (supports flexible date formats)",
  )
  .option("-e, --editor <name>", "Editor to use (overrides config)")
  .action(async (dateArgs, options) => {
    // Join date arguments into a single string (e.g., "jan 4" instead of ["jan", "4"])
    const dateArg =
      dateArgs && dateArgs.length > 0 ? dateArgs.join(" ") : undefined;
    try {
      await openCommand(dateArg, options);
    } catch (error) {
      console.error("Error during open:", error.message);
      process.exit(1);
    }
  });

program
  .command("config")
  .description("⚙️  Configure Jerd settings (editor, template)")
  .option("-e, --editor", "Configure editor only")
  .option("-t, --template", "Configure default template only")
  .action(async (options) => {
    try {
      await configCommand(options);
    } catch (error) {
      console.error("Error during config:", error.message);
      process.exit(1);
    }
  });

program
  .command("list [month] [year]")
  .description("📋 List journal entries")
  .option("-a, --all", "Show full tree of all entries")
  .action(async (month, year, options) => {
    const args = month ? (year ? [month, year] : [month]) : [];
    try {
      await listCommand(args, options);
    } catch (error) {
      console.error("Error during list:", error.message);
      process.exit(1);
    }
  });

program
  .command("mood [month] [year]")
  .description("📊 View mood trends over time")
  .option("-w, --week", "Show last 7 days (default)")
  .option("-m, --month", "Show last 30 days")
  .option("-y, --year", "Show last 365 days")
  .action(async (month, year, options) => {
    const args = month ? (year ? [month, year] : [month]) : [];
    try {
      await moodCommand(args, options);
    } catch (error) {
      console.error("Error during mood:", error.message);
      process.exit(1);
    }
  });

program
  .command("del [date...]")
  .description("🗑️  Delete a journal entry")
  .action(async (dateArgs) => {
    const dateArg =
      dateArgs && dateArgs.length > 0 ? dateArgs.join(" ") : undefined;
    try {
      await delCommand(dateArg);
    } catch (error) {
      console.error("Error during del:", error.message);
      process.exit(1);
    }
  });

program
  .command("streak")
  .description("🔥 View journaling streak and activity graph")
  .option("-w, --week", "Show last 7 days")
  .option("-m, --month", "Show last 30 days")
  .option("-y, --year", "Show last 365 days")
  .action(async (options) => {
    try {
      await streakCommand(options);
    } catch (error) {
      console.error("Error during streak:", error.message);
      process.exit(1);
    }
  });

async function main() {
  const hasArgs = process.argv.slice(2).length > 0;
  if (!hasArgs) {
    await landingScreen();
    return;
  }

  // Load theme preference before parsing commands
  try {
    const config = await loadConfig({ exitOnError: false });
    if (config && config.theme) {
      setTheme(config.theme);
    }
  } catch (e) {
    // Ignore errors here, default theme will be used
  }

  program.parse(process.argv);
}

main();
