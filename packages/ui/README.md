# @sudoku-web/ui

UI components and theming package for Sudoku Web applications.

## Purpose

Provides reusable UI components, theming, and styling utilities shared across applications.

## Public API

This package exports:
- Components: `Header`, `Footer`, `Button`, `Modal`, `Navigation`
- Providers: `ThemeProvider`
- Hooks: `useTheme`, `useDarkMode`
- Styles: Tailwind configuration, theme utilities

## Integration

```tsx
import { ThemeProvider, Header, Footer, useTheme } from '@sudoku-web/ui';

// Wrap your app with ThemeProvider
<ThemeProvider>
  <Header />
  <App />
  <Footer />
</ThemeProvider>

// Use theme in components
function MyComponent() {
  const { theme, setTheme } = useTheme();
  // ...
}
```

## Development

- `npm run type-check` - TypeScript type checking
- `npm run lint` - Linting
- `npm test` - Run tests
