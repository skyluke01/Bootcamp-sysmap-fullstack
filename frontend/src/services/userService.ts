const API_URL = "http://localhost:3000";

export type UserProfile = {
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

export async function getUserProfile() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Erro ao buscar perfil.",
    );
  }

  return data as UserProfile;
}

type UpdateUserProfileData = {
  name: string;
  email: string;
  password?: string;
};

export async function updateUserProfile(
  data: UpdateUserProfileData,
) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/user/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.error || "Erro ao atualizar perfil.",
    );
  }

  return responseData as UserProfile;
}

export async function updateUserAvatar(avatar: File) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("avatar", avatar);

  const response = await fetch(`${API_URL}/user/avatar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.error || "Erro ao atualizar avatar.",
    );
  }

  return responseData as {
    avatar: string;
  };
}