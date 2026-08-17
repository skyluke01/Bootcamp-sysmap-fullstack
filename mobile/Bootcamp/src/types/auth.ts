export type SignInRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  cpf: string;
  password: string;
};

export type Achievement = {
  id: string;
  name: string;
  criterion: string;
};

export type AuthResponse = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  avatar: string;
  xp: number;
  level: number;
  achievements: Achievement[];
  token: string;
};

export type ApiErrorResponse = {
  error: string;
};