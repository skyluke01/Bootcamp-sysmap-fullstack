import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { getUser } from "../utils/getUser";

type TopBarProps = {
  onCreateActivity: () => void;
};

export function TopBar({ onCreateActivity }: TopBarProps) {
  const navigate = useNavigate();
  const user = getUser();

  const userAvatar = user?.avatar;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  }

  return (
    <header className="flex items-center justify-between mb-8">
      <Link
        to="/home"
        className="flex items-center gap-3 text-3xl font-black text-emerald-600"
      >
        <span className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm">
          🏃
        </span>

        FITMEET
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={onCreateActivity}
          className="h-10 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          Criar atividade
        </button>

        <Link
          to="/perfil"
          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="
                w-10
                h-10
                rounded-full
                object-cover
                border-2
                border-emerald-500
              "
            />
          ) : (
            <span>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className="h-10 px-5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-sm font-medium transition-all active:scale-[0.98]"
        >
          Sair
        </button>
      </div>
    </header>
  );
}