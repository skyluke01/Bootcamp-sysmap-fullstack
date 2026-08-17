const API_URL = "http://localhost:3000";

type RequestConfig = {
  method?: string;
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  config: RequestConfig = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: config.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(config.token
        ? { Authorization: `Bearer ${config.token}` }
        : {}),
    },
    body: config.body
      ? JSON.stringify(config.body)
      : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro inesperado.");
  }

  return data;
}