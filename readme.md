# Jerd

A CLI tool for managing daily Markdown journals in a structured folder system.

## Features

- Simple, filesystem-based journal management
- Predictable structure: `Jerd/YYYY/MM/YYYY-MM-DD.md`
- Customizable templates via JSON
- Cross-platform support (macOS, Linux, Windows)
- Opens entries in your preferred editor

## Installation

```bash
npm install -g jerd
```

## Quick Start

### 1. Initialize Jerd

```bash
jerd init
```

This creates:

- `Jerd/` directory in your current location
- `config.json` with default settings
- `templates.json` with a default template

### 2. Create a Journal Entry

```bash
# Create today's entry
jerd new

# Create entry for specific date
jerd new 2024-12-25

# Use keywords
jerd new today
jerd new yesterday
jerd new tomorrow

# Use a specific template
jerd new --template default
```

## Commands

### `jerd init`

Initializes a new Jerd journal in the current directory.

- Creates `./jerd` folder
- Creates `jerd-config.json` with default editor settings
- Creates `templates.json` with default template

If Jerd is already initialized, it will prompt before overwriting.

### `jerd new [date] [--template <name>]`

Creates a new journal entry for the specified date (or today if not specified).

**Arguments:**

- `date` - Date in YYYY-MM-DD format, or keywords: today, yesterday, tomorrow

**Options:**

- `-t, --template <name>` - Template to use (default: from config.json)

**Behavior:**

- If the file exists, opens it without overwriting
- If the file doesn't exist, creates it from the template
- Opens the file in your configured editor

## File Structure

```
Jerd/
├── config.json
├── templates.json
├── 2025/
│   ├── 01/
│   │   ├── 2025-01-01.md
│   │   ├── 2025-01-02.md
│   │   └── ...
│   ├── 02/
│   │   └── ...
│   └── 12/
│       ├── 2025-12-24.md
│       └── 2025-12-25.md
└── 2026/
    └── ...
```

## Configuration

### jerd.config.json

```json
{
  "editor": "nano",
  "jerdPath": "./jerd",
  "dateFormat": "YYYY-MM-DD",
  "defaultTemplate": "default"
}
```

### templates.json

Templates define the structure of new journal entries.

```json
{
  "templates": [
    {
      "name": "default",
      "sections": [
        {
          "type": "auto-date",
          "title": "Date",
          "format": "dddd, MMMM D, YYYY"
        },
        {
          "type": "list",
          "title": "What I'm grateful for",
          "items": []
        },
        {
          "type": "text",
          "title": "Mood",
          "content": ""
        },
        {
          "type": "text",
          "title": "Notes",
          "content": ""
        }
      ]
    }
  ]
}
```

## Template Section Types

### 1. auto-date

Automatically inserts a formatted date.

```json
{
  "type": "auto-date",
  "title": "Date",
  "format": "dddd, MMMM D, YYYY"
}
```

Output:

```markdown
## Date

Thursday, December 25, 2025
```

### 2. list

Creates a markdown list.

```json
{
  "type": "list",
  "title": "Tasks",
  "items": []
}
```

Empty list output:

```markdown
## Tasks

-
```

With items:

```json
{
  "type": "list",
  "title": "Tasks",
  "items": ["Task 1", "Task 2"]
}
```

Output:

```markdown
## Tasks

- Task 1
- Task 2
```

### 3. text

Inserts text content.

```json
{
  "type": "text",
  "title": "Notes",
  "content": ""
}
```

Output:

```markdown
## Notes
```

## Creating Custom Templates

Edit `jerd/templates.json` to add custom templates:

```json
{
  "templates": [
    {
      "name": "work-log",
      "sections": [
        {
          "type": "auto-date",
          "title": "Date",
          "format": "YYYY-MM-DD"
        },
        {
          "type": "list",
          "title": "Completed",
          "items": []
        },
        {
          "type": "list",
          "title": "In Progress",
          "items": []
        },
        {
          "type": "list",
          "title": "Blocked",
          "items": []
        },
        {
          "type": "text",
          "title": "Notes",
          "content": ""
        }
      ]
    }
  ]
}
```

Then use it:

```bash
jerd new --template work-log
```

## Editor Configuration

Jerd respects your system's `$EDITOR` environment variable.

**Setting your editor:**
notepad"

````

Edit `jerd/config.json` directly:

```json
{
  "editor": "vim"
}
````

**Supported editors:**

- Terminal: nano, vim, vi, emacs, nvim, helix, micro
- GUI: code (VS Code), subl (Sublime Text), atom, gedit

## Examples

### Daily Journaling Workflow

```bash
# Morning routine
jerd new
# Opens today's entry, add morning thoughts

# Later in the day
jerd new
# Opens the same file, continue writing
```

### Reviewing Past Entries

Since entries are just markdown files, you can:

```bash
# View a specific entry
cat jerd/2025/12/2025-12-25.md

# Search all entries
grep -r "important note" jerd/

# List all December entries
ls jerd/2025/12/
```

## License

MIT

## Philosophy

Jerd follows a minimal, predictable, filesystem-based philosophy:

- **No database** - Just markdown files
- **Opinionated structure** - Predictable paths (YYYY/MM/YYYY-MM-DD.md)
- **External templates** - Easy to share and version control
- **Cross-platform** - Works everywhere Node.js runs
