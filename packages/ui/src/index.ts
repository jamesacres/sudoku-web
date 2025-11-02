// @sudoku-web/ui - UI Components Package
// Public API exports

// Components
export { default as Header } from './components/Header';
export { default as Footer } from './components/Footer';
export { default as HeaderBack } from './components/HeaderBack';
// Note: HeaderUser and HeaderOnline have app-specific dependencies (UserProvider, useOnline)
// They are copied to packages/ui but not exported - apps should copy/implement their own versions
// export { default as HeaderUser } from './components/HeaderUser';
// export { default as HeaderOnline } from './components/HeaderOnline';
export { default as ThemeControls } from './components/ThemeControls';
export { default as ThemeSwitch } from './components/ThemeSwitch';
export { default as ThemeColorSwitch } from './components/ThemeColorSwitch';
export { Toggle } from './components/Toggle/NotesToggle';

// Providers
export { ThemeColorProvider, useThemeColor } from './providers/ThemeColorProvider';

// Helpers
export { isCapacitor, isIOS, isAndroid } from './helpers/capacitor';

// Types
export type { ThemeConfig } from './types/ThemeConfig';
