// Helper exports
export * from './calculateSeconds';
export * from './formatSeconds';

// Re-export platform utilities from auth package (canonical location)
export {
  pkce,
  isCapacitor,
  isIOS,
  isAndroid,
  saveCapacitorState,
  getCapacitorState,
  CapacitorSecureStorage,
  isElectron,
  openBrowser,
  saveElectronState,
} from '@sudoku-web/auth';
