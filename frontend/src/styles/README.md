# FinLens CSS Architecture

This directory contains the modular CSS design system for FinLens.

## File Structure

```
styles/
  variables.css    # CSS custom properties (colors, spacing, typography)
  base.css         # Reset, typography, base element styles
  components.css   # Reusable component styles (buttons, cards, inputs)
  utilities.css    # Utility classes and layout helpers
  animations.css   # Keyframe animations and transitions
```

## Usage

All styles are imported in `index.css`:

```css
@import './styles/variables.css';
@import './styles/base.css';
@import './styles/components.css';
@import './styles/utilities.css';
@import './styles/animations.css';
```

## Design Principles

1. **CSS Variables First** - All values come from variables
2. **Modular** - Each file has a specific purpose
3. **Composable** - Mix and match utilities
4. **Performant** - Minimal specificity, efficient selectors
5. **Accessible** - WCAG AA compliant

## Adding New Styles

### Component Styles
Add to `components.css` if it's a reusable component pattern.

### Page-Specific Styles
Add to the page's CSS file (e.g., `Dashboard.css`) if it's page-specific.

### Utilities
Add to `utilities.css` if it's a general utility class.

## Best Practices

1. Always use CSS variables from `variables.css`
2. Follow BEM-like naming: `.component__element--modifier`
3. Keep specificity low (avoid deep nesting)
4. Use semantic class names
5. Document complex patterns

## Color Usage

- `--primary-500`: Main actions, links
- `--accent-500`: Secondary actions, highlights
- `--gray-*`: Text hierarchy, backgrounds
- Semantic colors: Status indicators only

## Spacing

Use the spacing scale (8px base):
- `--space-1` through `--space-16`
- Avoid arbitrary values

## Animations

- Keep durations short (150-300ms)
- Use `transform` and `opacity` for performance
- Provide reduced motion support (future)

## Responsive Design

Use mobile-first approach:
```css
/* Base styles (mobile) */
.component {
  /* mobile styles */
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    /* tablet styles */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    /* desktop styles */
  }
}
```
