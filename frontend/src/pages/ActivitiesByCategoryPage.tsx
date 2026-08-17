import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ActivityCard } from "../components/ActivityCard";
import { ActivityDetailsModal } from "../components/ActivityDetailsModal";
import { CompactActivityCard } from "../components/CompactActivityCard";
import { CreateActivityModal } from "../components/CreateActivityModal";
import { TopBar } from "../components/TopBar";
import { getActivities } from "../services/activityService";
import type { Activity, ActivityCategory } from "../types/activity";
import { activityTypeImages } from "../utils/activityTypeImages";
import { getUser } from "../utils/getUser";
import { mapActivityApiToActivity } from "../utils/mapActivityApiToActivity";

const categories: ActivityCategory[] = [
  "Futebol",
  "Basquete",
  "Caminhada",
  "Vôlei",
];

export function ActivitiesByCategoryPage() {
  const navigate = useNavigate();
  const { category } = useParams();

  const currentUser = getUser();
  const currentUserName = currentUser?.name || "Usuário";

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [visibleCompactCount, setVisibleCompactCount] = useState(12);

  async function loadActivities() {
    const response = await getActivities();

    setActivities(response.activities.map(mapActivityApiToActivity));
  }

  useEffect(() => {
    loadActivities();
    setVisibleCompactCount(12);
  }, [category]);

  const selectedCategory = category as ActivityCategory;

  const filteredActivities = activities.filter(
    (activity) =>
      activity.category === selectedCategory &&
      activity.status === "open",
  );

  const featuredActivities = filteredActivities.slice(0, 4);

  const compactActivities = filteredActivities.slice(
    4,
    4 + visibleCompactCount,
  );

  const hasMoreActivities =
    filteredActivities.length > 4 + visibleCompactCount;

  const otherCategories = categories.filter(
    (type) => type !== selectedCategory,
  );

  return (
    <main className="min-h-screen bg-gray-50 pt-6 pb-24">
      <div className="w-full max-w-[1400px] mx-auto px-6">
        <TopBar onCreateActivity={() => setIsCreateModalOpen(true)} />

        <section className="mt-10">
          <h1 className="text-4xl font-black uppercase mb-8">
            Popular em {selectedCategory}
          </h1>

          {filteredActivities.length === 0 ? (
            <p className="text-gray-500">
              Nenhuma atividade encontrada.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {featuredActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onClick={() => setSelectedActivity(activity)}
                  />
                ))}
              </div>

              {compactActivities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-10">
                  {compactActivities.map((activity) => (
                    <CompactActivityCard
                      key={activity.id}
                      activity={activity}
                      onClick={() => setSelectedActivity(activity)}
                    />
                  ))}
                </div>
              )}

              {hasMoreActivities && (
                <div className="flex justify-center mt-10">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCompactCount((current) => current + 8)
                    }
                    className="h-10 px-6 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600"
                  >
                    Ver mais
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-black uppercase mb-8">
            Outros tipos de atividade
          </h2>

          <div className="flex flex-wrap gap-8">
            {otherCategories.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => navigate(`/atividades/${type}`)}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 rounded-full border border-gray-200 bg-white flex items-center justify-center overflow-hidden hover:border-emerald-500 transition-all">
                  <img
                    src={activityTypeImages[type]}
                    alt={type}
                    className="w-14 h-14 object-contain"
                  />
                </div>

                <span className="text-sm font-bold">{type}</span>
              </button>
            ))}
          </div>
        </section>

        <ActivityDetailsModal
          activity={selectedActivity ?? undefined}
          isOpen={!!selectedActivity}
          isFull={false}
          isParticipating={false}
          isPending={false}
          isDenied={false}
          isOrganizer={false}
          joinRequests={[]}
          participants={[]}
          onClose={() => setSelectedActivity(null)}
          onToggleParticipation={() => {}}
          onCancelActivity={() => {}}
          onEditActivity={() => {}}
          onApproveRequest={() => {}}
          onDenyRequest={() => {}}
          onCheckIn={async () => {}}
          onConcludeActivity={async () => {}}
        />

        <CreateActivityModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          organizerName={currentUserName}
          onCreateActivity={async () => {
            await loadActivities();
          }}
        />
      </div>
    </main>
  );
}