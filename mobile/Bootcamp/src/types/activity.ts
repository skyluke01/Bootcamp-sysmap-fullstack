export type Activity = {
  id: string;
  title: string;
  description: string;
  type: string;
  confirmationCode: string | null;
  participantCount: number;
  image: string;
  scheduledDate: string;
  createdAt: string;
  completedAt: string | null;
  userSubscriptionStatus: string | null;
  private: boolean;

  address: {
    latitude: number;
    longitude: number;
  };

  creator: {
    id: string;
    name: string;
    avatar: string;
  };
};

export type ActivityType = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type Participant = {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  subscriptionStatus: string;
  confirmedAt: string | null;
};