# FinLens Design System

## Design Philosophy

**Core Principles:**
1. **Clarity Over Decoration** - Every element serves a purpose
2. **Financial Trust** - Professional, trustworthy, transparent
3. **Minimal Elegance** - Less is more, but make it count
4. **Accessibility First** - WCAG AA compliant, readable, usable
5. **Performance Conscious** - Lightweight CSS, efficient animations

---

## Color System

### Primary Palette (2-3 Colors)

**Primary Blue** - Trust, stability, professionalism
- `--primary-50`: #f0f4ff
- `--primary-100`: #e0e9ff
- `--primary-500`: #6366f1` (Main brand color)
- `--primary-600`: #4f46e5` (Hover states)
- `--primary-700`: #4338ca` (Active states)

**Accent Purple** - Innovation, intelligence
- `--accent-500`: #8b5cf6` (Secondary actions, highlights)
- `--accent-600`: #7c3aed` (Hover states)

**Neutral Grays** - Foundation, text, backgrounds
- `--gray-50`: #f8fafc` (Background)
- `--gray-100`: #f1f5f9` (Subtle backgrounds)
- `--gray-200`: #e2e8f0` (Borders)
- `--gray-400`: #94a3b8` (Placeholder text)
- `--gray-600`: #475569` (Secondary text)
- `--gray-900`: #0f172a` (Primary text)

### Semantic Colors

**Success** - Positive actions, gains
- `--success-500`: #10b981` (Green)
- `--success-50`: #d1fae5` (Light background)

**Warning** - Attention needed
- `--warning-500`: #f59e0b` (Amber)
- `--warning-50`: #fef3c7` (Light background)

**Danger** - Errors, losses
- `--danger-500`: #ef4444` (Red)
- `--danger-50`: #fee2e2` (Light background)

### Usage Rules
- **Primary**: Main actions, links, brand elements
- **Accent**: Secondary actions, highlights, ML insights
- **Gray**: Text hierarchy, backgrounds, borders
- **Semantic**: Status indicators, feedback only

---

## Typography System

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Type Scale

**Headings**
- `--text-4xl`: 2.25rem (36px) - Hero titles
- `--text-3xl`: 1.875rem (30px) - Page titles
- `--text-2xl`: 1.5rem (24px) - Section titles
- `--text-xl`: 1.25rem (20px) - Card titles
- `--text-lg`: 1.125rem (18px) - Subheadings

**Body**
- `--text-base`: 1rem (16px) - Default body text
- `--text-sm`: 0.875rem (14px) - Secondary text, captions
- `--text-xs`: 0.75rem (12px) - Labels, fine print

### Font Weights
- `--font-light`: 300 (Rare, decorative)
- `--font-normal`: 400 (Body text)
- `--font-medium`: 500 (Emphasis, buttons)
- `--font-semibold`: 600 (Headings, important)
- `--font-bold`: 700 (Hero, strong emphasis)

### Line Heights
- `--leading-tight`: 1.25 (Headings)
- `--leading-normal`: 1.5 (Body text)
- `--leading-relaxed`: 1.75 (Long-form content)

### Typography Rules
- **Headings**: Use semibold (600) or bold (700)
- **Body**: Normal weight (400), 1.5 line height
- **Links**: Medium weight (500), primary color
- **Labels**: Small text (14px), medium weight
- **Numbers**: Tabular numbers for financial data

---

## Spacing System

### Scale (8px base unit)
- `--space-1`: 0.25rem (4px)
- `--space-2`: 0.5rem (8px)
- `--space-3`: 0.75rem (12px)
- `--space-4`: 1rem (16px)
- `--space-5`: 1.25rem (20px)
- `--space-6`: 1.5rem (24px)
- `--space-8`: 2rem (32px)
- `--space-10`: 2.5rem (40px)
- `--space-12`: 3rem (48px)
- `--space-16`: 4rem (64px)

### Usage Rules
- **Padding**: Use 16px (1rem) minimum for touch targets
- **Gaps**: 24px (1.5rem) for card spacing, 16px for tight layouts
- **Margins**: 32px (2rem) between sections, 16px for related content
- **Consistency**: Stick to the scale, avoid arbitrary values

---

## Layout System

### Container
- Max width: 1200px
- Padding: 20px on mobile, 40px on desktop
- Centered with auto margins

### Grid System
- CSS Grid for complex layouts
- Flexbox for simple alignments
- Responsive breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Breakpoints
```css
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
```

---

## Component Patterns

### Cards
- Background: White (`--gray-50`)
- Border: None (use shadow instead)
- Border radius: 12px
- Padding: 24px
- Shadow: Soft, subtle (`--shadow-sm`)

### Buttons
- Primary: Primary color, white text
- Secondary: Accent color, white text
- Outline: Transparent, primary border
- Size: 40px height minimum
- Border radius: 8px
- Padding: 10px 20px

### Inputs
- Height: 44px (touch-friendly)
- Border: 2px solid gray-200
- Border radius: 8px
- Padding: 12px
- Focus: Primary border color, subtle shadow

### Badges
- Small: 20px height
- Border radius: 12px (pill shape)
- Padding: 4px 12px
- Font size: 12px
- Font weight: 500

---

## Shadow System

### Elevation Levels
- `--shadow-sm`: 0 1px 2px rgba(0, 0, 0, 0.05) - Subtle separation
- `--shadow-md`: 0 4px 6px rgba(0, 0, 0, 0.07) - Cards, dropdowns
- `--shadow-lg`: 0 10px 15px rgba(0, 0, 0, 0.1) - Modals, popovers
- `--shadow-xl`: 0 20px 25px rgba(0, 0, 0, 0.1) - Hero elements

### Usage Rules
- **Cards**: `shadow-md` default, `shadow-lg` on hover
- **Buttons**: No shadow default, `shadow-sm` on hover
- **Modals**: `shadow-xl`
- **Subtle elements**: `shadow-sm` or none

---

## Border Radius System

- `--radius-sm`: 4px - Small elements, tags
- `--radius-md`: 8px - Buttons, inputs
- `--radius-lg`: 12px - Cards, containers
- `--radius-xl`: 16px - Large cards, modals
- `--radius-full`: 9999px - Pills, avatars

---

## Animation Guidelines

### Timing Functions
- `--ease-in`: cubic-bezier(0.4, 0, 1, 1) - Enter animations
- `--ease-out`: cubic-bezier(0, 0, 0.2, 1) - Exit animations
- `--ease-in-out`: cubic-bezier(0.4, 0, 0.2, 1) - General transitions

### Durations
- `--duration-fast`: 150ms - Hover states, micro-interactions
- `--duration-normal`: 200ms - Standard transitions
- `--duration-slow`: 300ms - Complex animations

### Animation Principles
1. **Purposeful** - Every animation serves a function
2. **Subtle** - Don't distract from content
3. **Consistent** - Same timing for similar actions
4. **Performant** - Use transform/opacity, avoid layout shifts

### Common Animations

**Fade In**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Slide Up**
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Scale**
```css
@keyframes scale {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}
```

---

## Accessibility Guidelines

### Contrast Ratios
- **Text on white**: Minimum 4.5:1 (WCAG AA)
- **Large text**: Minimum 3:1
- **Interactive elements**: Minimum 3:1

### Focus States
- Visible outline: 2px solid primary color
- Offset: 2px from element
- Never remove focus indicators

### Touch Targets
- Minimum 44x44px
- Adequate spacing between targets (8px minimum)

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Proper heading hierarchy

---

## CSS Architecture Strategy

### File Organization
```
src/
  styles/
    base/
      reset.css          # Normalize/reset
      variables.css       # CSS custom properties
      typography.css      # Font system
    components/
      buttons.css
      cards.css
      forms.css
      navigation.css
    utilities/
      spacing.css
      layout.css
      animations.css
    pages/
      dashboard.css
      expenses.css
      groups.css
```

### Naming Convention
- **BEM-like**: `.component__element--modifier`
- **Utility classes**: `.u-spacing-*`, `.u-text-*`
- **Component classes**: `.card`, `.btn`, `.input`

### CSS Variables Strategy
- **Global**: Defined in `:root`
- **Component-scoped**: Defined in component selectors
- **Theme-aware**: Ready for dark mode (future)

### Performance Best Practices
1. **Minimize specificity** - Use classes, avoid deep nesting
2. **Reuse animations** - Define once, use many
3. **Optimize selectors** - Avoid complex selectors
4. **Critical CSS** - Inline above-the-fold styles
5. **Lazy load** - Non-critical CSS loaded async

---

## Component Examples

### Button
```css
.btn {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-primary {
  background: var(--primary-500);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
```

### Card
```css
.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-out);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Input
```css
.input {
  width: 100%;
  height: 44px;
  padding: var(--space-3);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-fast);
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

---

## Fintech-Specific Considerations

### Financial Data Display
- **Numbers**: Use tabular numbers for alignment
- **Currency**: Consistent formatting ($X,XXX.XX)
- **Colors**: Green for gains, red for losses
- **Charts**: Clean, minimal, data-focused

### Trust Indicators
- **Consistency**: Same patterns throughout
- **Transparency**: Clear labels, no hidden fees
- **Professional**: Clean, polished, error-free
- **Responsive**: Works on all devices

### Data Density
- **Balance**: Information-rich but not overwhelming
- **Whitespace**: Generous spacing for clarity
- **Hierarchy**: Clear visual hierarchy
- **Scannable**: Easy to find information

---

## Implementation Checklist

- [x] Define color system with CSS variables
- [x] Establish typography scale
- [x] Create spacing system
- [x] Design component patterns
- [x] Define animation guidelines
- [x] Set up CSS architecture
- [x] Document accessibility rules
- [x] Create example components

---

**This design system ensures consistency, professionalism, and a trustworthy fintech aesthetic while maintaining performance and accessibility.**
