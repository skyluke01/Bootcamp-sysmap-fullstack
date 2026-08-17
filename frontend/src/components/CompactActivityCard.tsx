import type { Activity } from "../types/activity";

type CompactActivityCardProps = {
  activity: Activity;
  onClick?: () => void;
};

export function CompactActivityCard({
  activity,
  onClick,
}: CompactActivityCardProps) {
  return (
    <article
      onClick={onClick}
      className="
        w-full
        max-w-[240px]
        flex
        items-center
        gap-3
        cursor-pointer
        group
      "
    >
      <div className="relative shrink-0">
        {activity.requiresApproval && (
          <span
            className="
              absolute
              left-1
              top-1
              z-10
              w-5
              h-5
              rounded-full
              bg-emerald-500
              text-white
              flex
              items-center
              justify-center
              text-[10px]
            "
          >
            🔒
          </span>
        )}

        <img
          src={activity.image}
          alt={activity.title}
          className="
            w-[72px]
            h-[72px]
            rounded-xl
            object-cover
            flex-shrink-0
          "
        />
      </div>

      <div className="min-w-0">
        <h3
          className="
            text-sm
            font-bold
            leading-tight
            line-clamp-2
            group-hover:underline
          "
        >
          {activity.title}
        </h3>

        <div
          className="
            flex
            items-center
            gap-2
            mt-2
            text-[11px]
            text-gray-500
            whitespace-nowrap
          "
        >
          <span>
            🗓{" "}
            {new Date(activity.date).toLocaleDateString("pt-BR")}
          </span>

          <span>|</span>

          <span>👥 {activity.participants}</span>
        </div>
      </div>
    </article>
  );
}