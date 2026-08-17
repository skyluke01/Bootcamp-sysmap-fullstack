import * as Keychain from 'react-native-keychain';
import { AuthResponse } from '../types/auth';

const AUTH_KEY = 'fitmeet_auth';

export const authStorage = {
  async saveAuth(data: AuthResponse) {
    await Keychain.setGenericPassword(AUTH_KEY, JSON.stringify(data), {
      service: AUTH_KEY,
    });
  },

  async getAuth(): Promise<AuthResponse | null> {
    const credentials = await Keychain.getGenericPassword({
      service: AUTH_KEY,
    });

    if (!credentials) {
      return null;
    }

    return JSON.parse(credentials.password);
  },

  async getToken(): Promise<string | null> {
    const auth = await this.getAuth();
    return auth?.token ?? null;
  },

  async clearAuth() {
    await Keychain.resetGenericPassword({
      service: AUTH_KEY,
    });
  },
};