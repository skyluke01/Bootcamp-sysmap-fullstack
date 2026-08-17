import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ActivityDetailsModal } from "../components/ActivityDetailsModal";
import { CompactActivityCard } from "../components/CompactActivityCard";
import { CreateActivityModal } from "../components/CreateActivityModal";
import { TopBar } from "../components/TopBar";

import {
  approveParticipation,
  checkInActivity,
  concludeActivity,
  deleteActivity,
  getActivityParticipants,
  getCreatedActivities,
  getParticipantActivities,
  subscribeActivity,
  unsubscribeActivity,
  type ActivityParticipant,
} from "../services/activityService";

import {
  getUserProfile,
  type UserProfile,
} from "../services/userService";

import type { Activity } from "../types/activity";
import { getUser } from "../utils/getUser";
import { mapActivityApiToActivity } from "../utils/mapActivityApiToActivity";

type JoinRequest = {
  activityId: string;
  participantId: string;
  userName: string;
  status: "pending" | "approved" | "denied";
};

export function ProfilePage() {
  const navigate = useNavigate();

  const currentUser = getUser();
  const currentUserName = currentUser?.name || "Usuário";

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [participatingActivities, setParticipatingActivities] = useState<
    Activity[]
  >([]);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [participants, setParticipants] = useState<ActivityParticipant[]>([]);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(12);

  async function loadProfileActivities() {
    try {
      const [userProfile, createdResponse, participantResponse] =
        await Promise.all([
          getUserProfile(),
          getCreatedActivities(),
          getParticipantActivities(),
        ]);

      setProfile(userProfile);

      setCreatedActivities(
        createdResponse.activities.map(mapActivityApiToActivity),
      );

      setParticipatingActivities(
        participantResponse.activities.map(mapActivityApiToActivity),
      );
    } catch {
      toast.error("Erro ao carregar dados do perfil.");
    }
  }

  async function loadActivityParticipants(activityId: string) {
    const data = await getActivityParticipants(activityId);
    setParticipants(data);
    return data;
  }

  async function handleOpenActivity(activity: Activity) {
    setSelectedActivity(activity);

    try {
      await loadActivityParticipants(activity.id);
    } catch {
      setParticipants([]);
    }
  }

  useEffect(() => {
    loadProfileActivities();
  }, []);

  const visibleParticipatingActivities = participatingActivities.slice(
    0,
    visibleHistoryCount,
  );

  const hasMoreParticipatingActivities =
    participatingActivities.length > visibleHistoryCount;

  const currentUserParticipation = participants.find(
    (participant) => participant.userId === currentUser?.id,
  );

  const isParticipating =
    currentUserParticipation?.subscriptionStatus === "CONFIRMED" ||
    currentUserParticipation?.subscriptionStatus === "APPROVED";

  const isPending =
    currentUserParticipation?.subscriptionStatus === "WAITING" ||
    currentUserParticipation?.subscriptionStatus === "PENDING";

  const isDenied =
    currentUserParticipation?.subscriptionStatus === "REJECTED";

  const currentActivityRequests: JoinRequest[] = selectedActivity
    ? participants
        .filter((participant) =>
          ["PENDING", "WAITING"].includes(participant.subscriptionStatus),
        )
        .map((participant) => ({
          activityId: selectedActivity.id,
          participantId: participant.id,
          userName: participant.name,
          status: "pending",
        }))
    : [];

  const isOrganizer = selectedActivity?.organizer === currentUserName;

  const isFull = selectedActivity
    ? selectedActivity.participants >= selectedActivity.maxParticipants
    : false;

  async function handleToggleParticipation() {
    if (!selectedActivity) return;

    try {
      if (isParticipating) {
        await unsubscribeActivity(selectedActivity.id);
        await loadActivityParticipants(selectedActivity.id);
        await loadProfileActivities();

        toast.success("Você saiu da atividade.");
        return;
      }

      await subscribeActivity(selectedActivity.id);
      await loadActivityParticipants(selectedActivity.id);
      await loadProfileActivities();

      toast.success(
        selectedActivity.requiresApproval
          ? "Solicitação enviada para aprovação."
          : "Participação confirmada!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar participação.",
      );
    }
  }

  async function handleCancelActivity() {
    if (!selectedActivity) return;

    try {
      await deleteActivity(selectedActivity.id);

      setCreatedActivities((previous) =>
        previous.filter((activity) => activity.id !== selectedActivity.id),
      );

      setSelectedActivity(null);

      toast.success("Atividade excluída com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir atividade.",
      );
    }
  }

  async function handleApproveRequest(participantId: string) {
    if (!selectedActivity) return;

    try {
      await approveParticipation(selectedActivity.id, participantId, true);
      await loadActivityParticipants(selectedActivity.id);
      await loadProfileActivities();

      toast.success("Participante aprovado.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao aprovar participante.",
      );
    }
  }

  async function handleDenyRequest(participantId: string) {
    if (!selectedActivity) return;

    try {
      await approveParticipation(selectedActivity.id, participantId, false);
      await loadActivityParticipants(selectedActivity.id);

      toast.success("Participante negado.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao negar participante.",
      );
    }
  }

  async function handleCheckIn(activityId: string, confirmationCode: string) {
    try {
      await checkInActivity(activityId, confirmationCode);
      await loadActivityParticipants(activityId);

      toast.success("Check-in realizado com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao fazer check-in.",
      );
    }
  }

  async function handleConcludeActivity(activityId: string) {
    try {
      await concludeActivity(activityId);
      await loadProfileActivities();

      setSelectedActivity((previous) =>
        previous?.id === activityId
          ? {
              ...previous,
              status: "closed",
            }
          : previous,
      );

      toast.success("Atividade encerrada com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao encerrar atividade.",
      );
    }
  }
  return (
    <main className="min-h-screen bg-gray-50 pt-6 pb-24">
      <div className="w-full max-w-[1400px] mx-auto px-6">
        <TopBar
          onCreateActivity={() => {
            setActivityToEdit(null);
            setIsCreateModalOpen(true);
          }}
        />

        <section
          className="
            mt-8
            bg-[#f7f7f7]
            rounded-[32px]
            border
            shadow-sm
            border-gray-200
            px-8
            py-10
            relative
          "
        >
          <button
            onClick={() => navigate("/perfil/editar")}
            className="
              absolute
              top-8
              right-8
              h-10
              px-4
              rounded-xl
              border
              bg-white
              text-sm
              text-gray-600
              hover:bg-gray-100
              transition-all
            "
          >
            ✎ Editar perfil
          </button>

          <div className="flex flex-col items-center">
            <img
              src={
                profile?.avatar?.trim()
                  ? profile.avatar
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={profile?.name || currentUserName}
              className="
                w-32
                h-32
                rounded-full
                object-cover
                border-4
                border-white
                shadow-md
                bg-white
              "
              onError={(event) => {
                event.currentTarget.src =
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png";
              }}
            />

            <h1
              className="
                mt-4
                text-4xl
                font-black
                uppercase
                text-center
              "
            >
              {profile?.name || currentUserName}
            </h1>

            <p className="text-gray-500 mt-2">
              Nível {profile?.level ?? 1}
              {" • "}
              {profile?.xp ?? 0} XP
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-black uppercase mb-6">
            Minhas atividades
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {createdActivities.slice(0, 3).map((activity) => (
              <CompactActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => handleOpenActivity(activity)}
              />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black uppercase mb-6">
            Histórico de atividades
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {visibleParticipatingActivities.map((activity) => (
              <CompactActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => handleOpenActivity(activity)}
              />
            ))}
          </div>

          {hasMoreParticipatingActivities && (
            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={() =>
                  setVisibleHistoryCount((current) => current + 12)
                }
                className="
                  h-10
                  px-6
                  rounded-lg
                  bg-emerald-500
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-emerald-600
                  transition-all
                "
              >
                Ver mais
              </button>
            </div>
          )}
        </section>

        <ActivityDetailsModal
          activity={selectedActivity ?? undefined}
          isOpen={!!selectedActivity}
          isFull={isFull}
          isParticipating={isParticipating}
          isPending={isPending}
          isDenied={isDenied}
          isOrganizer={isOrganizer}
          joinRequests={currentActivityRequests}
          participants={participants}
          onClose={() => setSelectedActivity(null)}
          onToggleParticipation={handleToggleParticipation}
          onCancelActivity={handleCancelActivity}
          onEditActivity={() => {
            if (!selectedActivity) return;

            setActivityToEdit(selectedActivity);

            setIsCreateModalOpen(true);

            setSelectedActivity(null);
          }}
          onApproveRequest={handleApproveRequest}
          onDenyRequest={handleDenyRequest}
          onCheckIn={handleCheckIn}
          onConcludeActivity={handleConcludeActivity}
        />

        <CreateActivityModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setActivityToEdit(null);
          }}
          activityToEdit={activityToEdit ?? undefined}
          organizerName={currentUserName}
          onCreateActivity={async () => {
            await loadProfileActivities();

            toast.success(
              "Atividade criada com sucesso!",
            );
          }}
          onUpdateActivity={async () => {
            await loadProfileActivities();

            setActivityToEdit(null);

            toast.success(
              "Atividade atualizada com sucesso!",
            );
          }}
        />
      </div>
    </main>
  );
}