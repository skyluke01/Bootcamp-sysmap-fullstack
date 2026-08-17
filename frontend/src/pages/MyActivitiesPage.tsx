import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivityCard } from "../components/ActivityCard";
import { TopBar } from "../components/TopBar";
import {
  getCreatedActivities,
  getParticipantActivities,
} from "../services/activityService";
import type { Activity } from "../types/activity";
import { mapActivityApiToActivity } from "../utils/mapActivityApiToActivity";

type Tab = "created" | "participating";

export function MyActivitiesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("created");
  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [participantActivities, setParticipantActivities] = useState<Activity[]>([]);

  useEffect(() => {
    async function loadMyActivities() {
      try {
        const [createdResponse, participantResponse] = await Promise.all([
          getCreatedActivities(),
          getParticipantActivities(),
        ]);

        setCreatedActivities(
          createdResponse.activities.map(mapActivityApiToActivity),
        );

        setParticipantActivities(
          participantResponse.activities.map(mapActivityApiToActivity),
        );
      } catch {
        toast.error("Erro ao carregar suas atividades.");
      }
    }

    loadMyActivities();
  }, []);

  const activities =
    activeTab === "created"
      ? createdActivities
      : participantActivities;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <TopBar onCreateActivity={() => {}} />

        <h1 className="text-3xl font-bold mb-6">
          Minhas atividades
        </h1>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab("created")}
            className={`px-4 py-2 rounded-lg border ${
              activeTab === "created"
                ? "bg-emerald-500 text-white"
                : "bg-white"
            }`}
          >
            Organizadas por mim
          </button>

          <button
            onClick={() => setActiveTab("participating")}
            className={`px-4 py-2 rounded-lg border ${
              activeTab === "participating"
                ? "bg-emerald-500 text-white"
                : "bg-white"
            }`}
          >
            Participando
          </button>
        </div>

        {activities.length === 0 ? (
          <p className="text-gray-500">
            Nenhuma atividade encontrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}