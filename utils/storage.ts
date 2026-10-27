/**
 * utils/storage.ts — Lưu trữ dữ liệu an toàn & tương thích đa nền tảng
 * - Web: window.localStorage
 * - Mobile (Android/iOS): @react-native-async-storage/async-storage
 * - Test / Node fallback: In-memory Map
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStore = new Map<string, string>();

export const appStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (AsyncStorage?.getItem) {
        const val = await AsyncStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {}
    return memoryStore.get(key) ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryStore.set(key, value);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      if (AsyncStorage?.setItem) {
        await AsyncStorage.setItem(key, value);
      }
    } catch {}
  },

  async deleteItem(key: string): Promise<void> {
    memoryStore.delete(key);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      if (AsyncStorage?.removeItem) {
        await AsyncStorage.removeItem(key);
      }
    } catch {}
  },

  async clear(): Promise<void> {
    memoryStore.clear();
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        return;
      }
      if (AsyncStorage?.clear) {
        await AsyncStorage.clear();
      }
    } catch {}
  },
};
