export type Achievement = {
  id: string;
  name: string;
  criterion: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  avatar: string;
  xp: number;
  level: number;
  achievements: Achievement[];
};