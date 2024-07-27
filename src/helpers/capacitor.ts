import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export enum CapacitorSecureStorage {
  STATE = 'STATE',
}

const isCapacitor = (): boolean =>
  ['android', 'ios'].includes(Capacitor.getPlatform());

const saveCapacitorState = async (state: any) => {
  const value = JSON.stringify(state);
  await SecureStoragePlugin.set({ key: CapacitorSecureStorage.STATE, value });
};

const getCapacitorState = async (): Promise<string> => {
  const result = await SecureStoragePlugin.get({
    key: CapacitorSecureStorage.STATE,
  });
  return result.value;
};

export { isCapacitor, saveCapacitorState, getCapacitorState };
