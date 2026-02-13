# Usage

[Getting Started](../getting-started/installation.md) · [Guide](usage.md) · [Reference](../reference/commands.md)

## Create a Journal Entry

```bash
jerd new
```

You can pass a date as an argument to create an entry for a specific day.

### Supported date formats

- Relative: `today`, `yesterday`
- ISO: `YYYY-MM-DD`
- Day only: `25`
- Day + month: `25 july`

---

## Open an Entry

```bash
jerd open today
```

Accepts any supported date format.

---

## Delete an Entry

```bash
jerd del today
```

Accepts any supported date format.

---

## Mood Graph

Visualize your mood history in the terminal.

```bash
jerd mood
```

---

## Streak Graph

Track journaling consistency across months.

```bash
jerd streak
```

---
## Navigation

**Previous:** [Quick Start](../getting-started/quick-start.md)  
**Next:** [Configuration](configuration.md)
