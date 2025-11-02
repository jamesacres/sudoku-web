// @sudoku-web/auth - Authentication Package
// Public API exports

// Types
export type { UserProfile, User, UserPreferences, AuthToken, SessionState } from './types';

// Providers
export { AuthProvider, UserContext } from './providers';
export type { UserContextInterface, AuthFetchHook } from './providers';

// Components
export { default as HeaderUser } from './components/HeaderUser';
export type { HeaderUserDependencies } from './components';
export { UserAvatar, UserButton, UserPanel, DeleteAccountDialog } from './components';
export type { UserPanelDependencies } from './components';

// Services
export { pkce, isCapacitor, isElectron, getCapacitorState, saveCapacitorState, openBrowser, saveElectronState } from './services';
