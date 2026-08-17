import { api } from '../api/api';
import { authStorage } from '../storage/authStorage';
import { AuthResponse, RegisterRequest, SignInRequest } from '../types/auth';

export const authService = {
  signIn: async (data: SignInRequest) => {
    await authStorage.clearAuth();

    const response = await api.post<AuthResponse>('/auth/sign-in', data);

    return response.data;
  },

  register: async (data: RegisterRequest) => {
    await authStorage.clearAuth();

    const response = await api.post('/auth/register', data);

    return response.data;
  },
};