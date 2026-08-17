import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { TopBar } from "../components/TopBar";
import {
  defineUserPreferences,
  getActivityTypes,
  getUserPreferences,
  type ActivityType,
} from "../services/preferencesService";
import {
  getUserProfile,
  updateUserAvatar,
  updateUserProfile,
} from "../services/userService";
import { deactivateAccount } from "../services/deactivateAccountService";
import { activityTypeImages } from "../utils/activityTypeImages";

export function EditProfilePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");

  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profile, preferences, types] = await Promise.all([
          getUserProfile(),
          getUserPreferences(),
          getActivityTypes(),
        ]);

        setName(profile.name);
        setEmail(profile.email);
        setCpf(profile.cpf);
        setAvatar(profile.avatar);
        setActivityTypes(types);

        setSelectedPreferences(
          preferences.map((preference) => preference.typeId),
        );
      } catch {
        toast.error("Erro ao carregar perfil.");
      }
    }

    loadProfile();
  }, []);

  function togglePreference(id: string) {
    setSelectedPreferences((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const response = await updateUserAvatar(file);

      setAvatar(response.avatar);

      toast.success("Avatar atualizado!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao atualizar avatar.");
      }
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);

      await Promise.all([
        updateUserProfile({
          name,
          email,
          password: password || undefined,
        }),
        defineUserPreferences(selectedPreferences),
      ]);

      toast.success("Perfil atualizado!");

      navigate("/perfil");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao atualizar perfil.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivateAccount() {
    try {
      setIsDeactivating(true);

      await deactivateAccount();

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Conta desativada com sucesso.");

      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao desativar conta.");
      }
    } finally {
      setIsDeactivating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f8] px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <TopBar onCreateActivity={() => {}} />

        <div className="max-w-[360px] mx-auto mt-6">
          <button
            onClick={() => navigate("/perfil")}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-all mb-10"
          >
            <ArrowLeft size={18} />
            Voltar para o perfil
          </button>

          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <img
                src={
                  avatar?.trim()
                    ? avatar
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={name}
                className="w-[120px] h-[120px] rounded-full object-cover shadow-md bg-gray-100"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
              />

              <label className="absolute bottom-1 right-0 w-10 h-10 rounded-full bg-white border shadow flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
                <Camera size={18} />

                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div className="w-full space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nome completo <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full h-[46px] px-4 rounded-lg border border-gray-200 bg-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  CPF <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={cpf}
                  disabled
                  className="w-full h-[46px] px-4 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  E-mail <span className="text-red-500">*</span>
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full h-[46px] px-4 rounded-lg border border-gray-200 bg-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Senha <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Ex: joao123"
                    className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-300 bg-white outline-none focus:border-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-4">
                  Preferências <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-4 overflow-x-auto pb-2">
                  {activityTypes.map((type) => {
                    const isSelected = selectedPreferences.includes(type.id);

                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => togglePreference(type.id)}
                        className="flex flex-col items-center min-w-[72px]"
                      >
                        <div
                          className={`w-16 h-16 rounded-full border-2 overflow-hidden transition-all ${
                            isSelected
                              ? "border-emerald-500"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={activityTypeImages[type.name]}
                            alt={type.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <span className="mt-2 text-sm font-semibold">
                          {type.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 h-[46px] rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                  {isSaving ? "Salvando..." : "Editar"}
                </button>

                <button
                  onClick={() => navigate("/perfil")}
                  className="flex-1 h-[46px] rounded-lg border border-gray-300 bg-white font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
              </div>

              <button
                onClick={() => setIsDeactivateModalOpen(true)}
                className="w-full text-red-500 font-semibold text-sm pt-3 hover:text-red-600 transition-all"
              >
                🗑 Desativar minha conta
              </button>
            </div>
          </div>
        </div>
      </div>

      {isDeactivateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-center mb-4">
              Desativar conta
            </h2>

            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              Tem certeza que deseja desativar sua conta?
              <br />
              Essa ação não poderá ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="flex-1 h-[46px] rounded-lg border border-gray-300 font-semibold hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={handleDeactivateAccount}
                disabled={isDeactivating}
                className="flex-1 h-[46px] rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isDeactivating ? "Desativando..." : "Desativar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}