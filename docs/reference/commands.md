# Commands

[Getting Started](../getting-started/installation.md) · [Guide](../guide/usage.md) · [Reference](commands.md)

## `jerd`

Open the interactive home screen from an initialized project.

```bash
jerd
```

If the current directory is not initialized, this starts the init flow.

## `jerd init [directory]`

Initialize a journal project.

```bash
jerd init
jerd init .
jerd init my-journal
```

When no directory is provided, Jerd creates a `jerd` directory under the current
directory. Passing `.` currently follows the same default and also targets a
`jerd` directory. Passing another name initializes that directory.

## `jerd new`

Ask for today's mood, then open today's entry in your editor. Pass a mood to
skip the check-in screen.

```bash
jerd new
jerd new --mood calm
jerd new -mood calm
jerd new -m happy
```

Entries are saved in replace mode for the current day, so editing an existing
entry updates that day's Markdown file. The selected mood is saved in the
entry frontmatter. Valid mood values are `happy`, `calm`, `neutral`, `sad`, and
`angry`. If the mood is misspelled, Jerd opens a selector so you can choose the
correct mood.

## `jerd open <date>`

Open an existing entry directly in your editor without opening the interactive
TUI.

```bash
jerd open today
jerd open yesterday
jerd open 2026-07-07
```

The date argument supports `today`, `yesterday`, or an ISO date in
`YYYY-MM-DD` format. This command only opens existing entries. If the selected
date does not have an entry, Jerd exits with an error and does not create a new
file. Use `jerd new` to create or mood-check today's entry.

## `jerd find [search term]`

Open the interactive search screen.

```bash
jerd find
jerd find "work notes"
jerd find today
jerd find 2026-05-31
```

When a search term is provided, Jerd opens the find screen with the input
already populated and the results filtered. Quoted and unquoted multi-word
queries are supported.

Use Enter to open the selected result in your editor.

## `jerd cal`

Open the current month calendar.

```bash
jerd cal
```

Use Enter to open the selected day when that day has an entry.

## `jerd mood`

Open the mood graph. Pass a short month and year to start on that month.

```bash
jerd mood
jerd mood jul 2026
```

Use left and right arrows to move between months.

## `--screen`

Render a specific internal screen. This is mainly useful for development and
testing.

```bash
jerd --screen=home
jerd --screen=find
jerd --screen=mood-tracker
```

Supported values are `home`, `calendar`, `find`, `mood-check-in`,
`mood-tracker`, `init`, `project-init`, and `new-entry`.

## Navigation

**Previous:** [Configuration](../guide/configuration.md)  
**Next:** [File Structure](file-structure.md)
