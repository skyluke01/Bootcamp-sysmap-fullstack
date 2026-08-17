import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

import { reverseGeocode } from "../services/locationService";
import type { Activity } from "../types/activity";
import { getUser } from "../utils/getUser";
import { Modal } from "./Modal";

type JoinRequest = {
  activityId: string;
  participantId: string;
  userName: string;
  status: "pending" | "approved" | "denied";
};

type Participant = {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  subscriptionStatus: string;
  confirmedAt: string | null;
};

type ActivityDetailsModalProps = {
  activity: Activity | undefined;
  isOpen: boolean;
  isFull: boolean;
  isParticipating: boolean | undefined;
  isPending: boolean | undefined;
  isDenied: boolean | undefined;
  isOrganizer: boolean;
  joinRequests: JoinRequest[];
  participants: Participant[];
  onClose: () => void;
  onToggleParticipation: () => void;
  onCancelActivity: () => void;
  onEditActivity: () => void;
  onApproveRequest: (participantId: string) => void;
  onDenyRequest: (participantId: string) => void;
  onCheckIn: (activityId: string, confirmationCode: string) => Promise<void>;
  onConcludeActivity: (activityId: string) => Promise<void>;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function ActivityDetailsModal({
  activity,
  isOpen,
  isFull,
  isParticipating,
  isPending,
  isDenied,
  isOrganizer,
  joinRequests,
  participants,
  onClose,
  onToggleParticipation,
  onEditActivity,
  onApproveRequest,
  onDenyRequest,
  onCheckIn,
  onConcludeActivity,
}: ActivityDetailsModalProps) {
  const [realAddress, setRealAddress] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isConcluding, setIsConcluding] = useState(false);

  const currentUser = getUser();

  useEffect(() => {
    async function loadAddress() {
      if (!activity?.latitude || !activity?.longitude) {
        setRealAddress("");
        return;
      }

      try {
        const address = await reverseGeocode(
          activity.latitude,
          activity.longitude,
        );

        setRealAddress(address);
      } catch {
        setRealAddress("");
      }
    }

    loadAddress();
  }, [activity?.latitude, activity?.longitude]);

  useEffect(() => {
    setConfirmationCode("");
  }, [activity?.id]);

  if (!activity) return null;

  const currentParticipant = participants.find(
    (participant) => participant.userId === currentUser?.id,
  );

  const isCheckedIn = !!currentParticipant?.confirmedAt;

  const activityDate = new Date(activity.date);
  const now = new Date();

  const hasStarted = now >= activityDate;

  const thirtyMinutesAfterStart = new Date(
    activityDate.getTime() + 30 * 60 * 1000,
  );

  const isActivityInProgress =
    now >= thirtyMinutesAfterStart && activity.status === "open";

  const isActivityClosed = activity.status === "closed";
  const isActivityCancelled = activity.status === "cancelled";
  const isActivityUnavailable = isActivityClosed || isActivityCancelled;

  const confirmedParticipants = participants.filter((participant) =>
    ["APPROVED", "CONFIRMED"].includes(participant.subscriptionStatus),
  );

  const hasLocation =
    typeof activity.latitude === "number" &&
    typeof activity.longitude === "number";

  const formattedDate = new Date(activity.date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleCheckIn() {
    if (!activity || !confirmationCode.trim()) return;

    try {
      setIsCheckingIn(true);
      await onCheckIn(activity.id, confirmationCode);
      setConfirmationCode("");
    } finally {
      setIsCheckingIn(false);
    }
  }

  async function handleConcludeActivity() {
    if (!activity) return;

    try {
      setIsConcluding(true);
      await onConcludeActivity(activity.id);
    } finally {
      setIsConcluding(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-[860px] bg-white rounded-2xl px-8 py-7 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-8">
          <div className="min-w-0 overflow-hidden">
            <img
              src={activity.image}
              alt={activity.title}
              className="w-full h-[205px] object-cover rounded-xl mb-5"
            />

            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 break-words">
              {activity.title}
            </h2>

            <p
              className="
                text-sm
                text-gray-600
                leading-relaxed
                mb-5
                max-h-[120px]
                overflow-y-auto
                whitespace-pre-wrap
                break-words
                [overflow-wrap:anywhere]
                pr-2
              "
            >
              {activity.description}
            </p>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p>📅 {formattedDate}</p>
              <p>👥 {activity.participants} participantes</p>
              <p>
                🔒{" "}
                {activity.requiresApproval
                  ? "Mediante aprovação"
                  : "Inscrição livre"}
              </p>
            </div>

            {isParticipating &&
              !isOrganizer &&
              !isActivityUnavailable &&
              hasStarted && (
                <div className="mb-6">
                  <h3 className="text-sm font-black uppercase mb-3">
                    Faça seu check-in
                  </h3>

                  {isCheckedIn ? (
                    <div className="flex items-center gap-2">
                      <input
                        value="Check-in confirmado"
                        disabled
                        className="h-11 px-4 rounded-lg border border-gray-200 bg-gray-100 text-sm w-full"
                      />

                      <button
                        disabled
                        className="h-11 w-11 rounded-lg bg-emerald-500 text-white flex items-center justify-center"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Código de check-in"
                        value={confirmationCode}
                        onChange={(event) =>
                          setConfirmationCode(event.target.value)
                        }
                        className="h-10 flex-1 rounded-md border px-3 text-sm outline-none focus:border-emerald-500"
                      />

                      <button
                        type="button"
                        disabled={!confirmationCode.trim() || isCheckingIn}
                        onClick={handleCheckIn}
                        className="h-10 px-5 rounded-md bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {isCheckingIn ? "..." : "Confirmar"}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {isOrganizer ? (
              <div className="flex flex-wrap gap-3">
                {!hasStarted && !isActivityUnavailable && (
                  <button
                    onClick={onEditActivity}
                    className="w-36 h-10 border border-gray-900 text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-all"
                  >
                    ✎ Editar
                  </button>
                )}

                {hasStarted && !isActivityUnavailable && (
                  <button
                    onClick={handleConcludeActivity}
                    disabled={isConcluding}
                    className="w-44 h-10 bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-all"
                  >
                    {isConcluding
                      ? "Encerrando..."
                      : "Encerrar atividade"}
                  </button>
                )}

                {isActivityClosed && (
                  <button
                    disabled
                    className="w-44 h-10 border border-gray-400 text-gray-700 text-sm font-semibold bg-white"
                  >
                    Atividade encerrada
                  </button>
                )}

                {isActivityCancelled && (
                  <button
                    disabled
                    className="w-44 h-10 bg-red-500 text-white text-sm font-semibold"
                  >
                    Atividade cancelada
                  </button>
                )}
              </div>
            ) : isActivityInProgress ? (
              <button
                disabled
                className="w-44 h-10 mt-4 border border-gray-400 text-gray-700 text-sm font-semibold bg-white"
              >
                Atividade em andamento
              </button>
            ) : isActivityCancelled ? (
              <button
                disabled
                className="w-44 h-10 bg-red-500 text-white text-sm font-semibold"
              >
                Atividade cancelada
              </button>
            ) : isActivityClosed ? (
              <button
                disabled
                className="w-44 h-10 border border-gray-400 text-gray-700 text-sm font-semibold bg-white"
              >
                Atividade encerrada
              </button>
            ) : (
              <button
                disabled={
                  hasStarted ||
                  (isFull && !isParticipating) ||
                  !!isPending ||
                  !!isDenied
                }
                onClick={onToggleParticipation}
                className={`
                  w-44 h-10 text-sm font-semibold transition-all disabled:cursor-not-allowed
                  ${
                    isDenied
                      ? "bg-red-500 text-white"
                      : isParticipating
                        ? "border border-red-500 text-red-500 bg-white hover:bg-red-50"
                        : isPending
                          ? "bg-emerald-500 text-white opacity-80"
                          : isFull
                            ? "bg-gray-300 text-white"
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                  }
                `}
              >
                {hasStarted
                  ? "Atividade em andamento"
                  : isFull && !isParticipating
                    ? "Atividade lotada"
                    : isParticipating
                      ? "Desinscrever"
                      : isPending
                        ? "Aguardando aprovação"
                        : isDenied
                          ? "Inscrição negada"
                          : "Participar"}
              </button>
            )}
          </div>

          <div className="min-w-0 overflow-hidden">
            <h3 className="text-xl font-black uppercase mb-3">
              Ponto de encontro
            </h3>

            {hasLocation ? (
              <div className="h-44 w-full overflow-hidden rounded-xl border mb-3">
                <MapContainer
                  center={[activity.latitude!, activity.longitude!]}
                  zoom={14}
                  scrollWheelZoom={false}
                  dragging={false}
                  doubleClickZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker
                    position={[activity.latitude!, activity.longitude!]}
                    icon={markerIcon}
                  />
                </MapContainer>
              </div>
            ) : (
              <div className="h-44 rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-500 mb-3">
                Localização não informada
              </div>
            )}

            <p className="text-xs text-gray-500 mb-6 leading-relaxed break-words">
              📍{" "}
              {realAddress ||
                activity.location ||
                "Localização selecionada"}
            </p>

            <h3 className="text-xl font-black uppercase mb-4">
              Participantes
            </h3>

            <div className="max-h-[220px] overflow-y-auto pr-3 space-y-3">
              {confirmedParticipants.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum participante confirmado.
                </p>
              ) : (
                confirmedParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={
                          participant.avatar ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt={participant.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                      />

                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {participant.name}
                        </p>

                        <p className="text-[11px] text-gray-500">
                          {participant.name === activity.organizer
                            ? "Organizador"
                            : "Participante"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isOrganizer &&
                !isActivityUnavailable &&
                joinRequests.map((request) => (
                  <div
                    key={request.participantId}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        alt={request.userName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400"
                      />

                      <div>
                        <p className="text-sm font-semibold">
                          {request.userName}
                        </p>

                        <p className="text-[11px] text-gray-500">
                          Aguardando aprovação
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          onApproveRequest(request.participantId)
                        }
                        className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs"
                      >
                        ✓
                      </button>

                      <button
                        onClick={() =>
                          onDenyRequest(request.participantId)
                        }
                        className="w-6 h-6 rounded-full bg-red-500 text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {isOrganizer &&
              hasStarted &&
              activity.confirmationCode && (
                <div className="mt-6 rounded-xl bg-gray-100 px-5 py-4">
                  <p className="text-xs text-gray-500 mb-1">
                    Código de check-in
                  </p>

                  <p className="text-2xl font-black tracking-widest break-all">
                    {activity.confirmationCode}
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </Modal>
  );
}