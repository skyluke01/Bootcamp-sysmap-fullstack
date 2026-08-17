import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivityCard } from "../components/ActivityCard";
import { ActivityDetailsModal } from "../components/ActivityDetailsModal";
import { CategoryList } from "../components/CategoryList";
import { CreateActivityModal } from "../components/CreateActivityModal";
import { PreferencesModal } from "../components/PreferencesModal";
import { SkeletonActivityCard } from "../components/SkeletonActivityCard";
import { SmallActivityCard } from "../components/SmallActivityCard";
import { TopBar } from "../components/TopBar";

import {
  approveParticipation,
  checkInActivity,
  concludeActivity,
  deleteActivity,
  getActivities,
  getActivityParticipants,
  subscribeActivity,
  unsubscribeActivity,
  type ActivityParticipant,
} from "../services/activityService";

import { getUserPreferences } from "../services/preferencesService";

import type {
  Activity,
  ActivityCategory,
} from "../types/activity";

import { getUser } from "../utils/getUser";
import { mapActivityApiToActivity } from "../utils/mapActivityApiToActivity";

type JoinRequest = {
  activityId: string;
  participantId: string;
  userName: string;
  status: "pending" | "approved" | "denied";
};

const categoryOrder: ActivityCategory[] = [
  "Futebol",
  "Caminhada",
  "Basquete",
  "Vôlei",
];

export function HomePage() {
  const navigate = useNavigate();

  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [activityToEdit, setActivityToEdit] =
    useState<Activity | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [participants, setParticipants] =
    useState<ActivityParticipant[]>([]);

  const [isPreferencesModalOpen, setIsPreferencesModalOpen] =
    useState(false);

  const [isLoadingActivities, setIsLoadingActivities] =
    useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const currentUser = getUser();

  const currentUserName =
    currentUser?.name || "Usuário";

  async function loadActivities() {
    try {
      setIsLoadingActivities(true);

      const response = await getActivities();

      setActivities(
        response.activities.map(
          mapActivityApiToActivity,
        ),
      );
    } catch {
      toast.error("Erro ao carregar atividades.");
    } finally {
      setIsLoadingActivities(false);
    }
  }

  async function checkPreferences() {
    try {
      const preferences =
        await getUserPreferences();

      if (preferences.length === 0) {
        setIsPreferencesModalOpen(true);
      }
    } catch {
      //
    }
  }

  async function refreshParticipants(
    activityId: string,
  ) {
    const data =
      await getActivityParticipants(activityId);

    const confirmedCount = data.filter(
      (participant) =>
        ["CONFIRMED", "APPROVED"].includes(
          participant.subscriptionStatus,
        ),
    ).length;

    setParticipants(data);

    setActivities((previous) =>
      previous.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              participants: confirmedCount,
            }
          : activity,
      ),
    );

    setSelectedActivity((previous) =>
      previous?.id === activityId
        ? {
            ...previous,
            participants: confirmedCount,
          }
        : previous,
    );

    return data;
  }

  async function handleOpenActivity(
    activity: Activity,
  ) {
    setSelectedActivity(activity);

    try {
      await refreshParticipants(activity.id);
    } catch {
      setParticipants([]);
    }
  }

  useEffect(() => {
    loadActivities();
    checkPreferences();
  }, []);

  const visibleActivities = activities.filter(
    (activity) => {
      const isOpen =
        activity.status === "open";

      const matchesCategory =
        !selectedCategory ||
        activity.category === selectedCategory;

      return isOpen && matchesCategory;
    },
  );

  const activitiesByCategory =
    visibleActivities.reduce(
      (acc, activity) => {
        if (!acc[activity.category]) {
          acc[activity.category] = [];
        }

        acc[activity.category].push(activity);

        return acc;
      },
      {} as Record<string, Activity[]>,
    );

  const orderedCategoryEntries =
    categoryOrder
      .map(
        (category) =>
          [
            category,
            activitiesByCategory[category] || [],
          ] as const,
      )
      .filter(
        ([, categoryActivities]) =>
          categoryActivities.length > 0,
      );

  const currentSelectedActivity =
    activities.find(
      (activity) =>
        activity.id === selectedActivity?.id,
    ) || selectedActivity;

  const currentUserParticipation =
    participants.find(
      (participant) =>
        participant.userId === currentUser?.id,
    );

  const isParticipating =
    currentUserParticipation?.subscriptionStatus ===
      "CONFIRMED" ||
    currentUserParticipation?.subscriptionStatus ===
      "APPROVED";

  const isPending =
    currentUserParticipation?.subscriptionStatus ===
      "WAITING" ||
    currentUserParticipation?.subscriptionStatus ===
      "PENDING";

  const isDenied =
    currentUserParticipation?.subscriptionStatus ===
    "REJECTED";

  const currentActivityRequests: JoinRequest[] =
    currentSelectedActivity
      ? participants
          .filter((participant) =>
            ["PENDING", "WAITING"].includes(
              participant.subscriptionStatus,
            ),
          )
          .map((participant) => ({
            activityId:
              currentSelectedActivity.id,
            participantId: participant.id,
            userName: participant.name,
            status: "pending",
          }))
      : [];

  const isOrganizer =
    currentSelectedActivity?.organizer ===
    currentUserName;

  const isFull = currentSelectedActivity
    ? currentSelectedActivity.participants >=
      currentSelectedActivity.maxParticipants
    : false;
  async function handleToggleParticipation() {
    if (!currentSelectedActivity) return;

    try {
      if (isParticipating) {
        await unsubscribeActivity(
          currentSelectedActivity.id,
        );

        await refreshParticipants(
          currentSelectedActivity.id,
        );

        await loadActivities();

        toast.success(
          "Você saiu da atividade.",
        );

        return;
      }

      await subscribeActivity(
        currentSelectedActivity.id,
      );

      await refreshParticipants(
        currentSelectedActivity.id,
      );

      await loadActivities();

      toast.success(
        currentSelectedActivity.requiresApproval
          ? "Solicitação enviada para aprovação."
          : "Participação confirmada!",
      );
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes(
            "Você já se registrou nesta atividade",
          )
        ) {
          await refreshParticipants(
            currentSelectedActivity.id,
          );

          toast.info(
            "Você já participa desta atividade.",
          );

          return;
        }

        toast.error(error.message);
      } else {
        toast.error(
          "Erro ao atualizar participação.",
        );
      }
    }
  }

  async function handleCancelActivity() {
    if (!currentSelectedActivity) return;

    try {
      await deleteActivity(
        currentSelectedActivity.id,
      );

      setActivities((previous) =>
        previous.filter(
          (activity) =>
            activity.id !==
            currentSelectedActivity.id,
        ),
      );

      setSelectedActivity({
        ...currentSelectedActivity,
        status: "cancelled",
      });

      toast.success(
        "Atividade cancelada com sucesso!",
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "Erro ao cancelar atividade.",
        );
      }
    }
  }

  async function handleApproveRequest(
    participantId: string,
  ) {
    if (!currentSelectedActivity) return;

    try {
      await approveParticipation(
        currentSelectedActivity.id,
        participantId,
        true,
      );

      await refreshParticipants(
        currentSelectedActivity.id,
      );

      await loadActivities();

      toast.success(
        "Participante aprovado.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao aprovar participante.",
      );
    }
  }

  async function handleDenyRequest(
    participantId: string,
  ) {
    if (!currentSelectedActivity) return;

    try {
      await approveParticipation(
        currentSelectedActivity.id,
        participantId,
        false,
      );

      await refreshParticipants(
        currentSelectedActivity.id,
      );

      toast.success(
        "Participante negado.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao negar participante.",
      );
    }
  }

  async function handleCheckIn(
    activityId: string,
    confirmationCode: string,
  ) {
    try {
      await checkInActivity(
        activityId,
        confirmationCode,
      );

      await refreshParticipants(activityId);

      toast.success(
        "Check-in realizado com sucesso!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao fazer check-in.",
      );
    }
  }

  async function handleConcludeActivity(
    activityId: string,
  ) {
    try {
      await concludeActivity(activityId);

      setActivities((previous) =>
        previous.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                status: "closed",
              }
            : activity,
        ),
      );

      setSelectedActivity((previous) =>
        previous?.id === activityId
          ? {
              ...previous,
              status: "closed",
            }
          : previous,
      );

      await refreshParticipants(activityId);

      toast.success(
        "Atividade encerrada com sucesso!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao encerrar atividade.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-6 pb-20">
      <div className="w-full max-w-[1400px] mx-auto px-6">
        <TopBar
          onCreateActivity={() => {
            setActivityToEdit(null);
            setIsCreateModalOpen(true);
          }}
        />

        <section className="mt-8">
          <h2 className="text-2xl font-black uppercase mb-6">
            Recomendada para você
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7 max-w-[1050px]">
            {isLoadingActivities
              ? Array.from({
                  length: 3,
                }).map((_, index) => (
                  <SkeletonActivityCard
                    key={index}
                  />
                ))
              : visibleActivities
                  .slice(0, 3)
                  .map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onClick={() =>
                        handleOpenActivity(
                          activity,
                        )
                      }
                    />
                  ))}
          </div>
        </section>

        <div className="mt-14">
          <CategoryList
            selectedCategory={
              selectedCategory
            }
          />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10">
          {orderedCategoryEntries.map(
            ([
              category,
              categoryActivities,
            ]) => (
              <section key={category}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[22px] font-black uppercase tracking-tight">
                    {category}
                  </h2>

                  <button
                    onClick={() =>
                      navigate(
                        `/atividades/${category}`,
                      )
                    }
                    className="text-[12px] font-semibold text-gray-600 hover:text-black hover:underline"
                  >
                    Ver mais
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {categoryActivities
                    .slice(0, 4)
                    .map((activity) => (
                      <SmallActivityCard
                        key={activity.id}
                        activity={activity}
                        onClick={() =>
                          handleOpenActivity(
                            activity,
                          )
                        }
                      />
                    ))}
                </div>
              </section>
            ),
          )}
        </div>

        <ActivityDetailsModal
          activity={
            currentSelectedActivity ??
            undefined
          }
          isOpen={
            !!currentSelectedActivity
          }
          isFull={isFull}
          isParticipating={
            isParticipating
          }
          isPending={isPending}
          isDenied={isDenied}
          isOrganizer={isOrganizer}
          joinRequests={
            currentActivityRequests
          }
          participants={participants}
          onClose={() =>
            setSelectedActivity(null)
          }
          onToggleParticipation={
            handleToggleParticipation
          }
          onCancelActivity={
            handleCancelActivity
          }
          onEditActivity={() => {
            if (
              !currentSelectedActivity
            )
              return;

            setActivityToEdit(
              currentSelectedActivity,
            );

            setIsCreateModalOpen(true);

            setSelectedActivity(null);
          }}
          onApproveRequest={
            handleApproveRequest
          }
          onDenyRequest={
            handleDenyRequest
          }
          onCheckIn={handleCheckIn}
          onConcludeActivity={
            handleConcludeActivity
          }
        />

        <CreateActivityModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setActivityToEdit(null);
          }}
          activityToEdit={
            activityToEdit ?? undefined
          }
          organizerName={
            currentUserName
          }
          onCancelActivity={async () => {
            if (!activityToEdit) return;

            await deleteActivity(activityToEdit.id);

            setActivities((previous) =>
              previous.filter(
                (activity) => activity.id !== activityToEdit.id,
              ),
            );

            setIsCreateModalOpen(false);
            setActivityToEdit(null);

            toast.success("Atividade cancelada com sucesso!");
          }}
          onCreateActivity={async () => {
            await loadActivities();

            toast.success(
              "Atividade criada com sucesso!",
            );
          }}
          onUpdateActivity={async () => {
            await loadActivities();

            setActivityToEdit(null);

            toast.success(
              "Atividade atualizada com sucesso!",
            );
          }}
        />

        <PreferencesModal
          isOpen={
            isPreferencesModalOpen
          }
          onClose={() =>
            setIsPreferencesModalOpen(
              false,
            )
          }
          onSaved={() =>
            setIsPreferencesModalOpen(
              false,
            )
          }
        />
      </div>
    </main>
  );
}