const API_URL = "http://localhost:3000";

export async function deactivateAccount() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/user/deactivate`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Erro ao desativar conta.",
    );
  }

  return data;
}