export type ActivityApiResponse = {
  page: number;
  pageSize: number;
  totalActivities: number;
  totalPages: number;
  previous: number | null;
  next: number | null;

  activities: ActivityApi[];
};

export type ActivityApi = {
  id: string;
  title: string;
  description: string;
  type: string;
  image: string;
  confirmationCode: string;
  participantCount: number;

  address: {
    latitude: number;
    longitude: number;
  };

  scheduledDate: string;
  createdAt: string;
  completedAt: string | null;

  private: boolean;

  creator: {
    id: string;
    name: string;
    avatar: string;
  };
};