# File Structure

[Getting Started](../getting-started/installation.md) · [Guide](../guide/usage.md) · [Reference](commands.md)

Jerd stores journals as plain Markdown files grouped by year and month name.

## Project Layout

```text
jerd/
  jerd.config.json
  2026/
    june/
      2026_june_04.md
```

## Entry Paths

New entries use this path format:

```text
YYYY/month-name/YYYY_month-name_DD.md
```

For example:

```text
2026/june/2026_june_04.md
```

Month directory names are lowercase English names: `january`, `february`,
`march`, and so on.

## Entry Content

Entries are Markdown. Mood is stored in YAML-style frontmatter when a mood is
selected:

```markdown
---
mood: calm
---

Today I wrote from the terminal.
```

Search also reads optional frontmatter tags. Inline and list-style tags are
recognized:

```markdown
---
tags: [work, planning]
---
```

```markdown
---
tags:
  - work
  - planning
---
```

## Navigation

**Previous:** [Commands](commands.md)
