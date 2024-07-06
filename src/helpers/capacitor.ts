import { Capacitor } from '@capacitor/core';

const isCapacitor = (): boolean =>
  ['android', 'ios'].includes(Capacitor.getPlatform());

export { isCapacitor };
