import type {
  ActivityApi,
  ActivityApiResponse,
} from "../types/activityApi";

import { apiRequest } from "./api";

const API_URL = "http://localhost:3000";

export type ActivityTypeApi = {
  id: string;
  name: string;
  description: string;
  image: string;
};

type CreateActivityData = {
  title: string;
  description: string;
  typeId: string;
  address: string;
  image: File;
  scheduledDate: string;
  private: boolean;
};

export function getActivities() {
  const token = localStorage.getItem("token");

  return apiRequest<ActivityApiResponse>(
    "/activities?page=1&pageSize=100&orderBy=createdAt&order=desc",
    {
      token: token || undefined,
    },
  );
}

export function getActivityTypes() {
  const token = localStorage.getItem("token");

  return apiRequest<ActivityTypeApi[]>(
    "/activities/types",
    {
      token: token || undefined,
    },
  );
}

export async function createActivity(
  data: CreateActivityData,
) {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("typeId", data.typeId);
  formData.append("address", data.address);
  formData.append("image", data.image);
  formData.append("scheduledDate", data.scheduledDate);
  formData.append("private", String(data.private));

  const response = await fetch(`${API_URL}/activities/new`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type");

  const responseData = contentType?.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    throw new Error(
      responseData.error || "Erro ao criar atividade.",
    );
  }

  return responseData as ActivityApi;
}

export async function updateActivity(
  id: string,
  data: Partial<CreateActivityData>,
) {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  if (data.typeId) formData.append("typeId", data.typeId);
  if (data.address) formData.append("address", data.address);
  if (data.image) formData.append("image", data.image);
  if (data.scheduledDate) {
    formData.append("scheduledDate", data.scheduledDate);
  }
  if (data.private !== undefined) {
    formData.append("private", String(data.private));
  }

  const response = await fetch(
    `${API_URL}/activities/${id}/update`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const contentType = response.headers.get("content-type");

  const responseData = contentType?.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    throw new Error(
      responseData.error || "Erro ao editar atividade.",
    );
  }

  return responseData as ActivityApi;
}

export async function subscribeActivity(activityId: string) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/activities/${activityId}/subscribe`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Erro ao participar da atividade.",
    );
  }

  return data;
}

export async function unsubscribeActivity(activityId: string) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/activities/${activityId}/unsubscribe`,
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
      data.error || "Erro ao cancelar participação.",
    );
  }

  return data;
}

export async function deleteActivity(activityId: string) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/activities/${activityId}/delete`,
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
      data.error || "Erro ao excluir atividade.",
    );
  }

  return data;
}

export async function approveParticipation(
  activityId: string,
  participantId: string,
  approved: boolean,
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/activities/${activityId}/approve`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        participantId,
        approved,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Erro ao atualizar solicitação.",
    );
  }

  return data;
}

export type ActivityParticipant = {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  subscriptionStatus: string;
  confirmedAt: string | null;
};

export async function getActivityParticipants(
  activityId: string,
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/activities/${activityId}/participants`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Erro ao buscar participantes.",
    );
  }

  return data as ActivityParticipant[];
}

export function getCreatedActivities() {
  const token = localStorage.getItem("token");

  return apiRequest<ActivityApiResponse>(
    "/activities/user/creator?page=1&pageSize=100",
    {
      token: token || undefined,
    },
  );
}

export function getParticipantActivities() {
  const token = localStorage.getItem("token");

  return apiRequest<ActivityApiResponse>(
    "/activities/user/participant?page=1&pageSize=100",
    {
      token: token || undefined,
    },
  );
}

export async function checkInActivity(
  activityId: string,
  confirmationCode: string,
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/activities/${activityId}/check-in`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        confirmationCode,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Erro ao fazer check-in.",
    );
  }

  return data as {
    message: string;
  };
}

export async function concludeActivity(
  activityId: string,
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/activities/${activityId}/conclude`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Erro ao concluir atividade.",
    );
  }

  return data as {
    message: string;
  };
}