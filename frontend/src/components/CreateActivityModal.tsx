import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X } from "lucide-react";

import {
  createActivity,
  getActivityTypes,
  updateActivity,
  type ActivityTypeApi,
} from "../services/activityService";

import {
  reverseGeocode,
  searchLocations,
  type LocationSearchResult,
} from "../services/locationService";

import type { Activity } from "../types/activity";
import { activityTypeImages } from "../utils/activityTypeImages";
import { LocationPicker } from "./LocationPicker";

type CreateActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  organizerName: string;
  onCreateActivity?: () => void;
  onUpdateActivity?: () => void;
  onCancelActivity?: () => void | Promise<void>;
  activityToEdit?: Activity;
};

type CreateActivityFormData = {
  title: string;
  description: string;
  location: string;
  date: string;
  category: string;
  image: FileList;
};

export function CreateActivityModal({
  isOpen,
  onClose,
  onCreateActivity,
  onUpdateActivity,
  onCancelActivity,
  activityToEdit,
}: CreateActivityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activityTypes, setActivityTypes] = useState<ActivityTypeApi[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  const [latitude, setLatitude] = useState(-23.55052);
  const [longitude, setLongitude] = useState(-46.633308);

  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<
    LocationSearchResult[]
  >([]);

  const isEditing = !!activityToEdit;

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<CreateActivityFormData>({
      defaultValues: {
        title: "",
        description: "",
        location: "",
        date: "",
        category: "",
      },
    });

  const watchedImage = watch("image");
  const selectedCategory = watch("category");

  useEffect(() => {
    async function loadActivityTypes() {
      try {
        const types = await getActivityTypes();
        setActivityTypes(types);
      } catch {
        toast.error("Erro ao carregar tipos de atividade.");
      }
    }

    loadActivityTypes();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!locationQuery.trim()) {
        setLocationResults([]);
        return;
      }

      try {
        const results = await searchLocations(locationQuery);
        setLocationResults(results);
      } catch {
        setLocationResults([]);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [locationQuery]);

  useEffect(() => {
    if (watchedImage && watchedImage.length > 0) {
      const file = watchedImage[0];
      const imageUrl = URL.createObjectURL(file);

      setPreviewImage(imageUrl);

      return () => URL.revokeObjectURL(imageUrl);
    }
  }, [watchedImage]);

  useEffect(() => {
    if (!activityToEdit) {
      reset({
        title: "",
        description: "",
        location: "",
        date: "",
        category: "",
      });

      setPreviewImage(null);
      setIsPrivate(false);
      setLatitude(-23.55052);
      setLongitude(-46.633308);
      setLocationQuery("");
      setLocationResults([]);

      return;
    }

    reset({
      title: activityToEdit.title,
      description: activityToEdit.description,
      location: activityToEdit.location,
      date: activityToEdit.date.slice(0, 16),
      category:
        activityTypes.find(
          (type) => type.name === activityToEdit.category,
        )?.id || "",
    });

    setLocationQuery(activityToEdit.location);
    setPreviewImage(activityToEdit.image);
    setIsPrivate(activityToEdit.requiresApproval);

    if (activityToEdit.latitude && activityToEdit.longitude) {
      setLatitude(activityToEdit.latitude);
      setLongitude(activityToEdit.longitude);
    }
  }, [activityToEdit, activityTypes, reset]);

  async function handleChangeMapLocation(location: {
    latitude: number;
    longitude: number;
  }) {
    setLatitude(location.latitude);
    setLongitude(location.longitude);

    try {
      const address = await reverseGeocode(
        location.latitude,
        location.longitude,
      );

      setLocationQuery(address);
      setValue("location", address);
    } catch {
      setLocationQuery("Localização selecionada no mapa");
      setValue("location", "Localização selecionada no mapa");
    }
  }

  async function handleSelectLocation(result: LocationSearchResult) {
    const lat = Number(result.lat);
    const lon = Number(result.lon);

    setLatitude(lat);
    setLongitude(lon);
    setLocationQuery(result.display_name);
    setValue("location", result.display_name);
    setLocationResults([]);
  }

  async function handleCreateActivity(data: CreateActivityFormData) {
    try {
      setIsSubmitting(true);

      if (!isEditing && (!data.image || data.image.length === 0)) {
        toast.error("Selecione uma imagem.");
        return;
      }

      const addressName =
        data.location ||
        locationQuery ||
        "Localização selecionada no mapa";

      const activityPayload = {
        title: data.title,
        description: data.description,
        address: JSON.stringify({
          name: addressName,
          latitude,
          longitude,
        }),
        typeId: data.category,
        scheduledDate: new Date(data.date).toISOString(),
        private: isPrivate,
        image: data.image?.[0],
      };

      if (isEditing) {
        await updateActivity(activityToEdit.id, activityPayload);

        toast.success("Atividade atualizada com sucesso!");

        onUpdateActivity?.();
      } else {
        await createActivity({
          ...activityPayload,
          image: data.image[0],
        });

        toast.success("Atividade criada com sucesso!");

        onCreateActivity?.();
      }

      reset();

      setPreviewImage(null);
      setIsPrivate(false);
      setLatitude(-23.55052);
      setLongitude(-46.633308);
      setLocationQuery("");
      setLocationResults([]);

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Erro ao atualizar atividade."
            : "Erro ao criar atividade.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-[760px] rounded-xl px-8 py-7 relative">
        <button
          onClick={onClose}
          className="absolute top-7 right-7 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black uppercase tracking-tight mb-8">
          {isEditing ? "Editar atividade" : "Nova atividade"}
        </h2>

        <form
          onSubmit={handleSubmit(handleCreateActivity)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 mt-3">
                Imagem <span className="text-red-500">*</span>
              </label>

              <label className="h-[126px] border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer bg-white overflow-hidden">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-300 text-3xl">▧</span>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("image")}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Título <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Ex.: Aula de Ioga"
                className="w-full h-[46px] border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-emerald-500"
                {...register("title")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Descrição <span className="text-red-500">*</span>
              </label>

              <textarea
                placeholder="Como será a atividade? Quais as regras? O que é necessário para participar?"
                className="w-full h-[92px] border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-emerald-500"
                {...register("description")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Data <span className="text-red-500">*</span>
              </label>

              <input
                type="datetime-local"
                className="w-full h-[46px] border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-emerald-500"
                {...register("date")}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Tipo da atividade <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-4 overflow-x-auto pb-1">
                {activityTypes.map((type) => {
                  const isSelected = selectedCategory === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setValue("category", type.id, {
                          shouldValidate: true,
                        })
                      }
                      className="min-w-[64px] flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-16 h-16 rounded-full border-2 overflow-hidden bg-white ${
                          isSelected
                            ? "border-emerald-500"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={activityTypeImages[type.name] || type.image}
                          alt={type.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <span className="text-xs font-semibold">
                        {type.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <input type="hidden" {...register("category")} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Ponto de encontro <span className="text-red-500">*</span>
              </label>

              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onChange={handleChangeMapLocation}
              />

              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                📍 {locationQuery || "Selecione um ponto no mapa"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Requer aprovação para participar?{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`px-6 h-9 rounded-lg text-sm border ${
                    !isPrivate
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  Não
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`px-6 h-9 rounded-lg text-sm border ${
                    isPrivate
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  Sim
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-5">
              {isEditing && onCancelActivity && (
                <button
                  type="button"
                  onClick={onCancelActivity}
                  className="w-[180px] h-[46px] bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-all"
                >
                  Cancelar atividade
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-[180px] h-[46px] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-md transition-all"
              >
                {isSubmitting
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar"
                    : "Criar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}