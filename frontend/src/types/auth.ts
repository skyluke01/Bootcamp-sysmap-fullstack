export type SignInBody = {
  email: string;
  password: string;
};

export type SignInResponse = {
  token: string;
  id: string;
  name: string;
  email: string;
  cpf: string;
  avatar: string;
  xp: number;
  level: number;
  achievements: {
    name: string;
    criterion: string;
  }[];
};

export type RegisterBody = {
  name: string;
  email: string;
  cpf: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
};