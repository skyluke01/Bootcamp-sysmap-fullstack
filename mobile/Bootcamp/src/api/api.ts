import axios from 'axios';
import { authStorage } from '../storage/authStorage';

export const api = axios.create({
  baseURL: 'https://apibootcamp2026.sysmap.com.br',
  timeout: 10000,
});

api.interceptors.request.use(async config => {
  const publicRoutes = ['/auth/sign-in', '/auth/register'];

  if (config.url && publicRoutes.includes(config.url)) {
    delete config.headers.Authorization;
    return config;
  }

  const token = await authStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});