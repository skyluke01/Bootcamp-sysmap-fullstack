import type { ActivityApi } from "../types/activityApi";
import type { Activity } from "../types/activity";

export function mapActivityApiToActivity(
  activity: ActivityApi,
): Activity {
  let parsedAddress = {
    name: "Localização selecionada no mapa",
    latitude: 0,
    longitude: 0,
  };

  if (typeof activity.address === "string") {
    try {
      parsedAddress = JSON.parse(
        activity.address,
      );
    } catch {}
  } else if (activity.address) {
    parsedAddress = {
      name:
        "Localização selecionada no mapa",
      latitude:
        activity.address.latitude,
      longitude:
        activity.address.longitude,
    };
  }

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    category:
      activity.type as Activity["category"],
    date: activity.scheduledDate,

    location:
      parsedAddress.name ||
      "Localização selecionada no mapa",

    latitude:
      parsedAddress.latitude,

    longitude:
      parsedAddress.longitude,

    image: activity.image,
    organizer: activity.creator.name,
    participants:
      activity.participantCount,
    maxParticipants: 20,
    requiresApproval:
      activity.private,
    status:
      activity.completedAt
        ? "closed"
        : "open",
    confirmationCode: activity.confirmationCode,    
  };
}