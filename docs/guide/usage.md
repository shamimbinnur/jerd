# Usage

[Getting Started](../getting-started/installation.md) · [Guide](usage.md) · [Reference](../reference/commands.md)

Jerd is interactive by default. Run commands from an initialized journal
directory unless you are creating a new project with `jerd init`.

## Home

```bash
jerd
```

If the current directory has `jerd.config.json`, Jerd opens the home screen. If
no config is found, Jerd starts the init flow.

Home shortcuts:

- `w`: write a new entry.
- `f`: find entries.
- `c`: open the calendar.
- `m`: open the mood graph.

## Write

```bash
jerd new
```

Jerd asks for your mood, then opens today's entry in your configured editor. If
an entry already exists for today, the editor opens with the existing content and
saves it back in place.

To skip the mood check-in screen, pass a mood:

```bash
jerd new --mood calm
jerd new -mood calm
jerd new -m happy
```

If the mood is misspelled, Jerd opens a small selector so you can choose the
correct mood.

Before opening the editor, Jerd asks for a mood:

- `H`: happy
- `C`: calm
- `N`: neutral
- `S`: sad
- `A`: angry

Mood is stored in Markdown frontmatter:

```markdown
---
mood: happy
---
```

## Find

```bash
jerd find
```

Search supports:

- Empty query: newest entries first.
- Date aliases: `today`, `yesterday`.
- Relative dates: `3 days ago`, `3 days before`.
- ISO dates: `2026-05-31`.
- Text search across path, preview, content, and frontmatter tags.

Use the up and down arrows to select a result, then press Enter to open it in
your editor. Press Escape to return home.

## Calendar

```bash
jerd cal
```

The calendar shows the current month. Days with entries are highlighted.

- Arrow keys move the selected day.
- Enter opens the selected day's entry if one exists.
- Escape returns home.

## Mood Graph

```bash
jerd mood
```

The mood graph shows the selected month with days colored by the mood saved in
each entry's frontmatter.

- Left and right arrows move between months.
- Escape returns home.

## Navigation

**Previous:** [Quick Start](../getting-started/quick-start.md)  
**Next:** [Configuration](configuration.md)
