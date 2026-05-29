---
name: jerd-agent
description: Use this skill when working on the jerd terminal journaling app, especially when changing Ink screens, CLI flow, visual style, tests, or build output. It captures the project structure, UI tone, and validation steps needed to keep future agent work consistent.
---

# Jerd Agent

## Purpose

Use this skill to make focused changes to jerd, a TypeScript Ink CLI for terminal-first journaling.

## Project Map

- `source/app.tsx`: screen routing, keyboard handling, and timed transitions.
- `source/cli.tsx`: CLI flags and initial screen selection.
- `source/components/`: shared Ink layout primitives.
- `source/screens/`: individual screens rendered inside the notebook frame.
- `source/theme/colors.ts`: shared terminal color palette.
- `test.tsx`: Ink rendering tests for app screens and key interactions.

## Working Rules

- Preserve user changes in the dirty tree; read files before editing and avoid reverting unrelated work.
- Change `source/` first. Run `npm run build` when compiled `dist/` output needs to match the source.
- Keep screen edits inside the existing `MainFrame` proportions: narrow width, centered panels, and short copy.
- Reuse shared components and colors instead of introducing one-off Ink markup when screens should share a vibe.
- Keep static demo values consistent until a real data layer exists; do not invent persistence behavior.
- Avoid new runtime dependencies unless the feature cannot be implemented cleanly with Ink, React, and existing packages.

## UI Direction

- The desired visual tone is a compact terminal notebook: warm orange brand accents, muted text, bordered panels, and clear shortcut tiles.
- Home is the style reference for dashboard-like screens: brand header, centered metric panel, shortcut tile grid, and muted navigation hints.
- Loading, confirmation, and farewell screens should stay simpler but still use the same palette, border language, and concise journal-specific copy.
- Text must fit within the 44-column outer frame and should avoid long lines that wrap awkwardly in terminals.

## Validation

- For UI changes, update `test.tsx` assertions for changed visible copy.
- Run `npm run build` to catch TypeScript errors.
- Run `npm test` when practical; it covers formatting, lint, and AVA screen tests.
