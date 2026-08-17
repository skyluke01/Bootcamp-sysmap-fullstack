import type { Activity } from "../types/activity";

type SmallActivityCardProps = {
  activity: Activity;
  onClick?: () => void;
};

export function SmallActivityCard({
  activity,
  onClick,
}: SmallActivityCardProps) {
  const activityDate = new Date(activity.date);

  const thirtyMinutesAfterStart = new Date(
    activityDate.getTime() + 30 * 60 * 1000,
    );

  const isInProgress =
    activity.status === "open" &&
    new Date() >= thirtyMinutesAfterStart;

  const isClosed =
    activity.status === "closed";

  const isCancelled =
    activity.status === "cancelled";

  return (
    <article
      onClick={onClick}
      className="flex items-start gap-3 cursor-pointer group"
    >
      <div className="relative">
        {activity.requiresApproval && (
          <span className="absolute left-1 top-1 z-10 bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
            🔒
          </span>
        )}

        {isInProgress && (
          <span className="absolute right-1 top-1 z-10 bg-emerald-500 text-white text-[9px] font-bold px-2 py-[2px] rounded-full">
            Em andamento
          </span>
        )}

        {isClosed && (
          <span className="absolute right-1 top-1 z-10 bg-gray-700 text-white text-[9px] font-bold px-2 py-[2px] rounded-full">
            Encerrada
          </span>
        )}

        {isCancelled && (
          <span className="absolute right-1 top-1 z-10 bg-red-500 text-white text-[9px] font-bold px-2 py-[2px] rounded-full">
            Cancelada
          </span>
        )}

        <img
          src={activity.image}
          alt={activity.title}
          className="w-20 h-20 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm leading-tight line-clamp-2">
          {activity.title}
        </h3>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span>
            🗓{" "}
            {new Date(activity.date).toLocaleDateString(
              "pt-BR",
            )}
          </span>

          <span>
            👥 {activity.participants}
          </span>
        </div>
      </div>
    </article>
  );
}