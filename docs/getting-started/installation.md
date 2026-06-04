# Installation

[Getting Started](installation.md) · [Guide](../guide/usage.md) · [Reference](../reference/commands.md)

## Requirements

Jerd requires Node.js 16 or newer.

## Install Globally

```bash
npm install --global jerd
```

After installation, verify the CLI is available:

```bash
jerd --help
```

## Local Development

From the repository root:

```bash
npm install
npm run build
node dist/cli.js --help
```

During development you can keep TypeScript compiling in watch mode:

```bash
npm run dev
```

## Editor Setup

Jerd opens entries in your terminal editor. It resolves the editor in this order:

1. The `EDITOR` environment variable.
2. The `editor` value in `jerd.config.json`.
3. `vim` as the runtime fallback.

The generated project config currently defaults `editor` to `nvim`.

## Navigation

**Next:** [Quick Start](quick-start.md)
