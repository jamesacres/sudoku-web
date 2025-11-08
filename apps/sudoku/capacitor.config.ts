import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bubblyclouds.sudoku',
  appName: 'Sudoku Race',
  webDir: 'apps/sudoku/out',
  plugins: {
    Keyboard: {
      resizeOnFullScreen: true,
    },
  },
};

export default config;
