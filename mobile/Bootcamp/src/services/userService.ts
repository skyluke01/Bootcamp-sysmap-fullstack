import { api } from '../api/api';
import { User } from '../types/user';

type UpdateUserDTO = {
  name?: string;
  email?: string;
  password?: string;
};

export const userService = {
  getUser: async () => {
    const response = await api.get<User>('/user');
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/user/preferences');
    return response.data;
  },

  updateUser: async (data: UpdateUserDTO) => {
    const response = await api.put<User>('/user/update', data);
    return response.data;
  },

  updateAvatar: async (imageUri: string) => {
    const formData = new FormData();

    formData.append('avatar', {
      uri: imageUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await api.put('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  definePreferences: async (typeIds: string[]) => {
    const response = await api.post('/user/preferences/define', typeIds);
    return response.data;
  },

  deactivateUser: async () => {
    const response = await api.delete('/user/deactivate');
    return response.data;
  },
};