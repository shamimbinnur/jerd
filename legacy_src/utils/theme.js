import chalk from 'chalk';
import gradient from 'gradient-string';

const THEMES = {
    cozy: {
        name: 'Cozy',
        description: 'Warm purple and amber tones (Default)',
        colors: {
            primary: chalk.hex('#8b5cf6'), // soft purple
            primaryBold: chalk.hex('#8b5cf6').bold,
            accent: chalk.hex('#f59e0b'), // warm amber
            accentBold: chalk.hex('#f59e0b').bold,
            success: chalk.hex('#10b981'), // gentle green
            info: chalk.hex('#3b82f6'), // calm blue
            warning: chalk.hex('#f59e0b'), // soft amber
            error: chalk.hex('#ef4444'), // gentle red
            muted: chalk.hex('#6b7280'), // soft gray
            text: chalk.hex('#374151'), // warm dark gray
            bg: chalk.bgHex('#f9fafb'), // very light gray
            border: '#8b5cf6',
            gradient: ['#8b5cf6', '#ec4899', '#f59e0b'],
            softGradient: ['#a78bfa', '#fbbf24']
        },
        icons: {
            success: '✅',
            error: '💥',
            info: '🧭',
            warning: '⚠️',
            hint: '💡',
            folder: '📁',
            year: '📅',
            month: '📆',
            file: '📝',
            tree: '├──',
            treeLast: '└──',
            treeVertical: '│  ',
            treeSpace: '   '
        },
        styles: {
            borderStyle: 'round',
            padding: 1,
            margin: 1
        }
    },
    neon: {
        name: 'Neon',
        description: 'Cyberpunk visuals with high contrast',
        colors: {
            primary: chalk.hex('#00ff41'), // matrix green
            primaryBold: chalk.hex('#00ff41').bold,
            accent: chalk.hex('#ff00ff'), // magenta
            accentBold: chalk.hex('#ff00ff').bold,
            success: chalk.hex('#00ff41'),
            info: chalk.hex('#00ffff'), // cyan
            warning: chalk.hex('#ffff00'), // yellow
            error: chalk.hex('#ff0000'), // red
            muted: chalk.hex('#808080'),
            text: chalk.hex('#ffffff'),
            bg: chalk.bgBlack,
            border: '#00ffff',
            gradient: ['#00ff41', '#00ffff', '#ff00ff'],
            softGradient: ['#00ff41', '#ffff00']
        },
        icons: {
            success: '✔',
            error: '✖',
            info: 'ℹ',
            warning: '⚠',
            hint: '⚡',
            folder: '📂',
            year: '🗓',
            month: '📅',
            file: '📄',
            tree: '├─',
            treeLast: '└─',
            treeVertical: '│ ',
            treeSpace: '  '
        },
        styles: {
            borderStyle: 'double',
            padding: 1,
            margin: 1
        }
    },
    minimal: {
        name: 'Minimal',
        description: 'Clean, monochrome and blue',
        colors: {
            primary: chalk.blue,
            primaryBold: chalk.blue.bold,
            accent: chalk.cyan,
            accentBold: chalk.cyan.bold,
            success: chalk.green,
            info: chalk.blue,
            warning: chalk.yellow,
            error: chalk.red,
            muted: chalk.gray,
            text: chalk.white,
            bg: chalk.reset,
            border: 'blue',
            gradient: ['#60a5fa', '#3b82f6', '#2563eb'],
            softGradient: ['#93c5fd', '#60a5fa']
        },
        icons: {
            success: '✓',
            error: 'x',
            info: 'i',
            warning: '!',
            hint: '>',
            folder: '>',
            year: '•',
            month: '-',
            file: '•',
            tree: '  ',
            treeLast: '  ',
            treeVertical: '  ',
            treeSpace: '  '
        },
        styles: {
            borderStyle: 'classic',
            padding: 0,
            margin: 0
        }
    }
};

export const getTheme = (themeName = 'cozy') => {
    return THEMES[themeName] || THEMES.cozy;
};

export const getAllThemes = () => {
    return Object.keys(THEMES).map(key => ({
        value: key,
        ...THEMES[key]
    }));
};
