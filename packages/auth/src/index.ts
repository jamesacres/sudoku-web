/**
 * @sudoku-web/auth - Authentication Package
 *
 * Provides authentication functionality with OAuth 2.0 PKCE flow,
 * user management, and multi-platform support (web, iOS, Android, Electron).
 *
 * @packageDocumentation
 */

// ===== Types =====

/** User account information */
export type { User } from './types';

/** Extended user profile with preferences */
export type { UserProfile } from './types';

/** User preferences and settings */
export type { UserPreferences } from './types';

/** Authentication token information */
export type { AuthToken } from './types';

/** Authentication session state */
export type { SessionState } from './types';

// ===== Providers =====

/** React context provider for authentication state. Place at app root. */
export { AuthProvider } from './providers';

/** React context for accessing authentication state */
export { UserContext } from './providers';

/** TypeScript interface for UserContext */
export type { UserContextInterface } from './providers';

/** Hook type for authenticated fetch requests */
export type { AuthFetchHook } from './providers';

// ===== Components =====

/** Header component displaying user information and authentication state */
export { default as HeaderUser } from './components/HeaderUser';

/** User avatar component with fallback to initials */
export { UserAvatar } from './components';

/** Button component for user actions (profile, settings, logout) */
export { UserButton } from './components';

/** Full user profile panel with account management options */
export { UserPanel } from './components';

/** Dialog component for account deletion with confirmation */
export { DeleteAccountDialog } from './components';

/** Dependencies required by HeaderUser component */
export type { HeaderUserDependencies } from './components';

/** Dependencies required by UserPanel component */
export type { UserPanelDependencies } from './components';

// ===== Services =====

/** PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0 */
export { pkce } from './services';

/** Capacitor platform utilities for iOS/Android */
export { isCapacitor, isIOS, isAndroid, getCapacitorState, saveCapacitorState, CapacitorSecureStorage } from './services';

/** Electron platform utilities for desktop */
export { isElectron, openBrowser, saveElectronState } from './services';
