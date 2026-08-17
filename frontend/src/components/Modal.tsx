import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({
  isOpen,
  onClose,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        p-4
        z-50
      "
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="
        bg-white
        rounded-2xl
        w-full
        max-w-3xl
        p-4
        md:p-6
        relative
        shadow-2xl
        animate-in
        fade-in
        zoom-in-95
        slide-in-from-bottom-4
        duration-300
        ease-out
        max-h-[90vh]
        overflow-y-auto
      "
      >
        <button
          onClick={onClose}
          className="
            absolute
            top-4
            right-4
            text-gray-500
            hover:text-black
          "
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}