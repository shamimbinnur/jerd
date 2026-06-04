# Quick Start

[Getting Started](installation.md) · [Guide](../guide/usage.md) · [Reference](../reference/commands.md)

## 1. Initialize a Journal Project

```bash
jerd init
```

By default, this creates a `jerd` directory under your current directory and
walks you through project setup. Enter your name when prompted; Jerd writes it
to `jerd.config.json`.

To choose another project directory:

```bash
jerd init my-journal
```

## 2. Move Into the Project

```bash
cd jerd
```

If you initialized a custom directory, move into that directory instead.

## 3. Write Today's Entry

```bash
jerd new
```

Jerd asks for a mood, opens your editor, and saves the result as a Markdown file
for today's date.

## 4. Use the Home Screen

Run Jerd with no command from an initialized project:

```bash
jerd
```

The home screen provides these shortcuts:

- `w` opens mood check-in, then starts writing.
- `f` opens search.
- `c` opens the current month calendar.
- `m` opens the mood graph.

## Navigation

**Previous:** [Installation](installation.md)  
**Next:** [Usage](../guide/usage.md)
