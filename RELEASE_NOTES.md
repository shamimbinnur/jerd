# Commit Message

```
feat: add customizable theme system and UI enhancements

- Implement theme engine with Cozy, Neon, and Minimal themes
- Add theme selection to config command
- Update all UI components to use dynamic theming
- Add cd hint to init success message
- Remove unused imports and dead code
```

# Release Title

**v2.1.0 - Customizable Themes & Enhanced UI**

# Release Description

## 🎨 What's New

### Customizable Theme System
We've introduced a powerful theming engine that lets you personalize your journaling experience! Choose from three beautiful themes:

- **Cozy** (Default) - Warm purple and amber tones with rounded borders
- **Neon** - Cyberpunk-inspired with high-contrast green and magenta
- **Minimal** - Clean, monochrome design with blue accents

Switch themes anytime with `jerd config` and watch your entire CLI transform!

### Enhanced User Experience
- **Better Onboarding**: The `jerd init` command now shows a helpful `cd` hint in the success message
- **Consistent Theming**: All commands (list, new, config, etc.) now respect your chosen theme
- **Dynamic Icons**: Each theme comes with its own icon set for a cohesive look

### Code Quality Improvements
- Removed unused imports and dead code
- Centralized theme management for easier maintenance
- Improved color consistency across all commands

## 🚀 How to Use

1. Run `jerd config` to open the configuration menu
2. Select "Choose your visual theme"
3. Pick your favorite theme (Cozy, Neon, or Minimal)
4. Enjoy your personalized journaling experience!

## 📝 Technical Details

- New `src/utils/theme.js` module for theme management
- Updated `src/utils/ui.js` to support dynamic theming
- Theme preference saved in `jerd.config.js`
- All UI components now use theme-aware colors and icons

---

**Full Changelog**: Compare changes since last release
