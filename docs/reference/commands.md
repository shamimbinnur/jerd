# Commands

[Getting Started](../getting-started/installation.md) · [Guide](../guide/usage.md) · [Reference](commands.md)

This page lists the primary Jerd commands.

## `jerd init`

Initialize a journal directory.

```bash
jerd init
jerd init my-journal
```

## `jerd new`

Create a journal entry (defaults to today).

```bash
jerd new
jerd new yesterday
jerd new 2025-02-13
jerd new 25
jerd new 25 july
```

## `jerd open`

Open an existing entry.

```bash
jerd open today
jerd open 2025-02-13
```

## `jerd del`

Delete an entry.

```bash
jerd del today
```

## `jerd mood`

Show a mood graph over time.

```bash
jerd mood
```

## `jerd streak`

Show a streak/activity graph across months.

```bash
jerd streak
```

## `jerd config`

Open interactive configuration.

```bash
jerd config
```

---
## Navigation

**Previous:** [Configuration](../guide/configuration.md)  
**Next:** [File Structure](file-structure.md)
