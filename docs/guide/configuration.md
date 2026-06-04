# Configuration

[Getting Started](../getting-started/installation.md) · [Guide](usage.md) · [Reference](../reference/commands.md)

Jerd stores project configuration in `jerd.config.json` at the root of a journal
project.

## Created By Init

Running `jerd init` writes a config like this:

```json
{
	"name": "Shamim",
	"editor": "nvim",
	"createdAt": "2026-06-04T00:00:00.000Z",
	"updatedAt": "2026-06-04T00:00:00.000Z"
}
```

The timestamps are generated at setup time.

## Options

`name`
: Used by the home screen greeting.

`editor`
: Used when `EDITOR` is not set. Jerd opens entries with `EDITOR` first, then
this config value, then `vim`.

`createdAt`
: The original project setup timestamp.

`updatedAt`
: The last time init wrote the project config.

## Legacy Config

Jerd still detects `jerd.config.js` for compatibility with older projects and
will attempt to load it when no `jerd.config.json` exists. New projects should
use `jerd.config.json`.

## Navigation

**Previous:** [Usage](usage.md)  
**Next:** [Commands](../reference/commands.md)
