import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({
  label,
  error,
  type = "text",
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";

  return (
    <div className="space-y-2">
      <label className="block text-[15px] font-semibold text-gray-800">
        {label}
        <span className="text-red-500"> *</span>
      </label>

      <div className="relative">
        <input
          {...props}
          type={
            isPasswordField
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          className="
            w-full
            h-[46px]
            rounded-lg
            border
            border-gray-200
            bg-white
            px-4
            pr-11
            text-sm
            text-gray-800
            placeholder:text-gray-400
            outline-none
            transition-all
            focus:border-emerald-500
          "
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-gray-400
              hover:text-gray-600
            "
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}