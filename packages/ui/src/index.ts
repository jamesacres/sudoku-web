/**
 * @sudoku-web/ui - UI Components Package
 *
 * Provides reusable, accessible UI components with built-in theming support
 * (dark/light mode, custom theme colors) and responsive design for web, iOS,
 * Android, and desktop applications.
 *
 * @packageDocumentation
 */

// ===== Components =====

/** Application header with navigation and branding */
export { default as Header } from './components/Header';

/** Application footer with links and information */
export { default as Footer } from './components/Footer';

/** Back button component for navigation */
export { default as HeaderBack } from './components/HeaderBack';

/** Complete theme control panel with dark/light mode and color selection */
export { default as ThemeControls } from './components/ThemeControls';

/** Toggle switch for dark/light mode */
export { default as ThemeSwitch } from './components/ThemeSwitch';

/** Color picker for theme color customization */
export { default as ThemeColorSwitch } from './components/ThemeColorSwitch';

/** Generic toggle switch component */
export { Toggle } from './components/Toggle/NotesToggle';

/** Copy to clipboard button with platform-specific sharing support */
export { CopyButton } from './components/CopyButton';

/** Celebration animation with fireworks and number explosion effects */
export { CelebrationAnimation } from './components/CelebrationAnimation';

/** Error boundary component for catching React component errors */
export { default as ErrorBoundary } from './components/ErrorBoundary';

/** Global error handler for uncaught errors and promise rejections */
export { default as GlobalErrorHandler } from './components/GlobalErrorHandler';

// Note: HeaderUser and HeaderOnline have app-specific dependencies (UserProvider, useOnline)
// They are copied to packages/ui but not exported - apps should copy/implement their own versions

// ===== Providers =====

/** React context provider for theme color management. Place at app root. */
export { ThemeColorProvider } from './providers/ThemeColorProvider';

/** Hook to access and modify theme colors */
export { useThemeColor } from './providers/ThemeColorProvider';

// ===== Helpers =====

/** Check if running on Capacitor (mobile - iOS or Android) */
export { isCapacitor } from './helpers/capacitor';

/** Check if running on iOS */
export { isIOS } from './helpers/capacitor';

/** Check if running on Android */
export { isAndroid } from './helpers/capacitor';

// ===== Types =====

/** Theme configuration interface */
export type { ThemeConfig } from './types/ThemeConfig';
