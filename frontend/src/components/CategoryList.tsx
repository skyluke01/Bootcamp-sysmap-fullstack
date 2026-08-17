import { useNavigate } from "react-router-dom";

import type { ActivityCategory } from "../types/activity";
import { activityTypeImages } from "../utils/activityTypeImages";

type CategoryListProps = {
  selectedCategory: string | null;
};

const categories: ActivityCategory[] = [
  "Futebol",
  "Basquete",
  "Caminhada",
  "Vôlei",
];

export function CategoryList({
  selectedCategory,
}: CategoryListProps) {
  const navigate = useNavigate();

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-black uppercase mb-6">
        Tipos de atividade
      </h2>

      <div className="flex items-center gap-7 flex-wrap">
        {categories.map((category) => {
          const isSelected =
            selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() =>
                navigate(
                  `/atividades/${category}`,
                )
              }
              className="
                flex
                flex-col
                items-center
                gap-2
                group
              "
            >
              <div
                className={`
                  w-20
                  h-20
                  rounded-full
                  border
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                  bg-white
                  transition-all
                  ${
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500"
                      : "border-gray-200"
                  }
                `}
              >
                <img
                  src={activityTypeImages[category]}
                  alt={category}
                  className="
                    w-14
                    h-14
                    object-contain
                    group-hover:scale-105
                    transition-transform
                  "
                />
              </div>

              <span className="text-sm font-bold">
                {category}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}