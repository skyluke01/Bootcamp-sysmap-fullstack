const API_URL = "http://localhost:3000";

export type ActivityType = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type UserPreference = {
  typeId: string;
  typeName: string;
  typeDescription: string;
};

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getActivityTypes() {
  const response = await fetch(
    `${API_URL}/activities/types`,
    {
      headers: getAuthHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Erro ao buscar tipos.",
    );
  }

  return data as ActivityType[];
}

export async function getUserPreferences() {
  const response = await fetch(
    `${API_URL}/user/preferences`,
    {
      headers: getAuthHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Erro ao buscar preferências.",
    );
  }

  return data as UserPreference[];
}

export async function defineUserPreferences(
  ids: string[],
) {
  const response = await fetch(
    `${API_URL}/user/preferences/define`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
        ...getAuthHeaders(),
      },

      body: JSON.stringify(ids),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Erro ao salvar preferências.",
    );
  }

  return data;
}