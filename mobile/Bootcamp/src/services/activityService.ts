import { api } from '../api/api';
import { Activity, ActivityType, Participant } from '../types/activity';

type CreateActivityRequest = {
  title: string;
  description: string;
  typeId: string;
  address: string;
  scheduledDate: string;
  isPrivate: boolean;
  image: {
    uri: string;
    name: string;
    type: string;
  };
};

type UpdateActivityRequest = {
  id: string;
  title: string;
  description: string;
  typeId: string;
  address: string;
  scheduledDate: string;
  isPrivate: boolean;
  image?: {
    uri: string;
    name: string;
    type: string;
  };
};

function normalizeActivitiesResponse(data: any): Activity[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.activities)) return data.activities;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

async function getActivities(): Promise<Activity[]> {
  const response = await api.get('/activities');
  return normalizeActivitiesResponse(response.data);
}

async function getAllActivities(): Promise<Activity[]> {
  const response = await api.get('/activities/all');
  return normalizeActivitiesResponse(response.data);
}

async function getTypes(): Promise<ActivityType[]> {
  const response = await api.get('/activities/types');
  return Array.isArray(response.data) ? response.data : [];
}

async function getParticipants(activityId: string): Promise<Participant[]> {
  const response = await api.get(`/activities/${activityId}/participants`);
  return Array.isArray(response.data) ? response.data : [];
}

async function concludeActivity(activityId: string) {
  const response = await api.put(`/activities/${activityId}/conclude`);
  return response.data;
}

async function subscribeActivity(activityId: string) {
  const response = await api.post(`/activities/${activityId}/subscribe`);
  return response.data;
}

async function unsubscribeActivity(activityId: string) {
  const response = await api.delete(`/activities/${activityId}/unsubscribe`);
  return response.data;
}

async function approveParticipant(
  activityId: string,
  participantId: string,
  approved: boolean,
) {
  const response = await api.put(`/activities/${activityId}/approve`, {
    participantId,
    approved,
  });

  return response.data;
}

async function checkInActivity(activityId: string, confirmationCode: string) {
  const response = await api.put(`/activities/${activityId}/check-in`, {
    confirmationCode,
  });

  return response.data;
}

async function getUserCreatedActivities(): Promise<Activity[]> {
  const response = await api.get('/activities/user/creator');
  return normalizeActivitiesResponse(response.data);
}

async function getUserParticipantActivities(): Promise<Activity[]> {
  const response = await api.get('/activities/user/participant/all');
  return normalizeActivitiesResponse(response.data);
}

async function createActivity(data: CreateActivityRequest) {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('typeId', data.typeId);
  formData.append('address', data.address);
  formData.append('scheduledDate', data.scheduledDate);
  formData.append('isPrivate', String(data.isPrivate));

  formData.append('image', {
    uri: data.image.uri,
    name: data.image.name,
    type: data.image.type,
  } as any);

  const response = await api.post('/activities/new', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

async function updateActivity(data: UpdateActivityRequest) {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('typeId', data.typeId);
  formData.append('address', data.address);
  formData.append('scheduledDate', data.scheduledDate);
  formData.append('isPrivate', String(data.isPrivate));

  if (data.image) {
    formData.append('image', {
      uri: data.image.uri,
      name: data.image.name,
      type: data.image.type,
    } as any);
  }

  const response = await api.put(`/activities/${data.id}/update`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

async function getActivityById(activityId: string): Promise<Activity> {
  const activities = await getAllActivities();

  const activity = activities.find(item => item.id === activityId);

  if (!activity) {
    throw new Error('Atividade não encontrada.');
  }

  return activity;
}

async function deleteActivity(activityId: string) {
  const response = await api.delete(`/activities/${activityId}/delete`);
  return response.data;
}

export const activityService = {
  getActivities,
  getAllActivities,
  getTypes,
  getParticipants,
  createActivity,
  updateActivity,
  concludeActivity,
  subscribeActivity,
  unsubscribeActivity,
  approveParticipant,
  checkInActivity,
  getUserCreatedActivities,
  getUserParticipantActivities,
  getActivityById,
  deleteActivity,
};