# File Structure

[Getting Started](../getting-started/installation.md) · [Guide](../guide/usage.md) · [Reference](commands.md)

Jerd stores entries as plain Markdown files on your filesystem.

## Default layout

After initialization, Jerd creates a structure like:

```
jerd/
  2025/
    02/
      2025-02-01.md
      2025-02-02.md
      ...
  config.json
```

## Rules

- Entries are stored as: `YYYY/YYYY-MM/YYYY-MM-DD.md`
- Each year is a directory
- Each month is a directory
- Each day is a single Markdown file
- `config.json` stores your preferences

This predictable layout keeps your journal portable, searchable, and easy to back up.

---
## Navigation

**Previous:** [Commands](commands.md)
