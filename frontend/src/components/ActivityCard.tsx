import type { Activity } from "../types/activity";

type ActivityCardProps = {
  activity: Activity;
  onClick?: () => void;
};

export function ActivityCard({
  activity,
  onClick,
}: ActivityCardProps) {
  const activityDate = new Date(activity.date);

  const thirtyMinutesAfterStart = new Date(
    activityDate.getTime() + 30 * 60 * 1000,
  );

  const isInProgress =
    activity.status === "open" &&
    new Date() >= thirtyMinutesAfterStart;

  const isClosed = activity.status === "closed";
  const isCancelled = activity.status === "cancelled";

  return (
    <article
      onClick={onClick}
      className="w-full cursor-pointer group"
    >
      <div className="relative h-[150px] overflow-hidden rounded-xl bg-gray-100">
        {activity.requiresApproval && (
          <span className="absolute left-3 top-3 z-10 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">
            🔒
          </span>
        )}

        {isInProgress && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
            Em andamento
          </span>
        )}

        {isClosed && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-gray-800 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
            Encerrada
          </span>
        )}

        {isCancelled && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
            Cancelada
          </span>
        )}

        <img
          src={activity.image}
          alt={activity.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-3">
        <h3 className="text-[15px] font-black leading-tight line-clamp-2">
          {activity.title}
        </h3>

        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          <span>
            🗓{" "}
            {new Date(activity.date).toLocaleDateString("pt-BR")}
          </span>

          <span>👥 {activity.participants}</span>
        </div>
      </div>
    </article>
  );
}