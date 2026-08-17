import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white p-6">
      <section className="min-h-[calc(100vh-48px)] max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_0.85fr] gap-8 items-center">
        <div className="hidden lg:block">
          <img
            src="/login-image.png"
            alt="Pessoas praticando atividade física"
            className="w-full max-w-[860px] h-[820px] rounded-xl object-cover"
          />
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}