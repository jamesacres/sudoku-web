/**
 * @sudoku-web/template - Template/Party/Session Package
 *
 * Generic collaboration and application infrastructure package - game-agnostic
 * party/session management that can be used by any collaborative application.
 *
 * Provides party management, session tracking, member invitations, multi-platform
 * provider infrastructure, and application state management.
 *
 * @packageDocumentation
 */

// ===== Components =====
/**
 * UI components for app promotion and features
 * - AppDownloadModal: Modal promoting mobile app downloads
 * - SocialProof: Social proof / testimonials display component
 * - PremiumFeatures: Premium features showcase component
 *
 * Note: ErrorBoundary and GlobalErrorHandler have been moved to @sudoku-web/ui
 */
export { default as AppDownloadModal } from './components/AppDownloadModal';
export { default as SocialProof } from './components/SocialProof';
export { PremiumFeatures } from './components/PremiumFeatures';

// ===== Hooks =====
/**
 * React hooks for common functionality
 * - useOnline: Detect online/offline network status
 * - useLocalStorage: Persistent local storage with React state
 * - useWakeLock: Prevent device from sleeping
 * - useFetch: Authenticated API requests with error handling
 * - useDocumentVisibility: Track document visibility state (tab focus)
 * - useServerStorage: Sync state with server storage
 */
export * from './hooks';

// ===== Providers =====
/**
 * React context providers for application infrastructure
 * - CapacitorProvider: Capacitor platform initialization
 * - RevenueCatProvider: RevenueCat subscription integration
 * - UserProvider: User profile and authentication state
 * - FetchProvider: Authenticated API request handling
 * - ThemeColorProvider: Theme color management
 * - GlobalStateProvider: Global application state
 * - PartyProvider: Party/group management and collaboration
 */
export * from './providers';
export { UserContext, UserProvider, RevenueCatContext, RevenueCatProvider, GlobalStateContext, GlobalStateProvider, PartyContext, PartyProvider, FetchContext, FetchProvider } from './providers';

// ===== Types =====
/**
 * TypeScript type definitions
 * - Party: Party/group information
 * - PartyMember: Party member information
 * - PartyInvitation: Party invitation details
 * - Session<T>: Generic session with custom state type
 * - CollaborativeSession: Session for collaborative activities
 * - Server response types (SessionResponse, PartyResponse, etc.)
 */
export * from './types';

// ===== Utilities =====
/**
 * Utility functions
 * - dailyActionCounter: Track and limit daily actions
 * - playerColors: Assign consistent colors to players
 */
export * from './utils';

// ===== Helpers =====
/**
 * Helper functions
 * - calculateSeconds: Time calculations
 * - formatSeconds: Format seconds as MM:SS
 * - isCapacitor: Platform detection (canonical location)
 * - isIOS: Platform detection (canonical location)
 * - isAndroid: Platform detection (canonical location)
 * - isElectron: Platform detection (canonical location)
 * - saveCapacitorState: Capacitor state persistence (canonical location)
 * - getCapacitorState: Capacitor state retrieval (canonical location)
 * - openBrowser: Open browser for OAuth (canonical location)
 * - saveElectronState: Electron state persistence (canonical location)
 * - CapacitorSecureStorage: Capacitor storage enum (canonical location)
 *
 * Note: pkce OAuth utilities are in @sudoku-web/auth
 */
export * from './helpers';

// ===== Config =====
/**
 * Configuration constants
 * - dailyLimits: Daily action limits configuration
 * - premiumFeatures: Premium feature configuration
 */
export * from './config';

// Note: We don't re-export from @sudoku-web/auth, @sudoku-web/ui, or @sudoku-web/shared here
// to avoid circular dependencies and duplicate exports.
// Apps should import those packages directly when needed.
