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

Open today's entry in your editor.

```bash
jerd new
```

Entries are saved in replace mode for the current day, so editing an existing
entry updates that day's Markdown file.

## `jerd find`

Open the interactive search screen.

```bash
jerd find
```

Use Enter to open the selected result in your editor.

## `jerd cal`

Open the current month calendar.

```bash
jerd cal
```

Use Enter to open the selected day when that day has an entry.

## `jerd mood`

Open the mood graph.

```bash
jerd mood
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

Supported values are `home`, `calendar`, `find`, `mood-tracker`, `init`,
`project-init`, `loading`, `success`, `dashboard`, `confirmation`, `farewell`,
and `new-entry`.

## Navigation

**Previous:** [Configuration](../guide/configuration.md)  
**Next:** [File Structure](file-structure.md)
