import { Capacitor } from '@capacitor/core';

const isCapacitor = (): boolean =>
  ['android', 'ios'].includes(Capacitor.getPlatform());

const isIOS = (): boolean => Capacitor.getPlatform() === 'ios';
const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';

export { isCapacitor, isIOS, isAndroid };
