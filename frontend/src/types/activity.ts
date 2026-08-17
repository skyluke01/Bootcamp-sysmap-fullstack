export type ActivityCategory =
  | "Futebol"
  | "Basquete"
  | "Caminhada"
  | "Vôlei";

export type ActivityStatus =
  | "open"
  | "closed"
  | "cancelled";

export type Activity = {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  date: string;
  location: string;
  image: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
  requiresApproval: boolean;
  status: ActivityStatus;
  latitude?: number;
  longitude?: number;
  confirmationCode?: string;
};