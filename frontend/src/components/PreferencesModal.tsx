import { useEffect, useState } from "react";

import {
  defineUserPreferences,
  getActivityTypes,
  type ActivityType,
} from "../services/preferencesService";

import { activityTypeImages } from "../utils/activityTypeImages";

type PreferencesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function PreferencesModal({
  isOpen,
  onClose,
  onSaved,
}: PreferencesModalProps) {
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadTypes() {
      const data = await getActivityTypes();
      setTypes(data);
    }

    loadTypes();
  }, [isOpen]);

  function toggleType(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }

  async function handleSave() {
    if (!selectedIds.length) return;

    try {
      setIsLoading(true);
      await defineUserPreferences(selectedIds);
      onSaved();
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center px-4">
      <div className="w-full max-w-[520px] bg-white rounded-xl px-10 py-9">
        <h2 className="text-[24px] font-black uppercase text-center mb-10">
          Selecione as suas atividades preferidas
        </h2>

        <div className="grid grid-cols-4 gap-x-7 gap-y-8">
          {types.map((type) => {
            const isSelected = selectedIds.includes(type.id);

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleType(type.id)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`
                    w-16 h-16 rounded-full overflow-hidden border-2 transition-all
                    ${
                      isSelected
                        ? "border-emerald-500"
                        : "border-transparent"
                    }
                  `}
                >
                  <img
                    src={activityTypeImages[type.name] || type.image}
                    alt={type.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <span className="text-xs font-bold">
                  {type.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-10">
          <button
            onClick={handleSave}
            disabled={!selectedIds.length || isLoading}
            className="h-11 rounded-md bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Confirmar"}
          </button>

          <button
            onClick={onClose}
            className="h-11 rounded-md border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50"
          >
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}