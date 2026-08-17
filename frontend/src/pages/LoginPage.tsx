import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Input } from "../components/Input";
import { Button } from "../components/ui/button";
import { AuthLayout } from "../layouts/AuthLayout";
import { signIn } from "../services/authService";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function handleLogin(data: LoginFormData) {
    try {
      const response = await signIn({
        email: data.email,
        password: data.password,
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response));

      toast.success("Login realizado!");

      navigate("/home");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao fazer login.");
      }
    }
  }

  return (
    <AuthLayout>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
          🏃
        </div>

        <h1 className="text-[30px] font-black text-emerald-600">
          FITMEET
        </h1>
      </div>

      <h2 className="text-[28px] font-black mb-3">
        BEM-VINDO DE VOLTA!
      </h2>

      <p className="text-[16px] text-gray-500 mb-6">
        Encontre parceiros para treinar ao ar livre.
        <br />
        Conecte-se e comece agora!
      </p>

      <form
        onSubmit={handleSubmit(handleLogin)}
        className="space-y-4"
      >
        <Input
          label="E-mail"
          type="email"
          placeholder="Ex.: joao@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Ex.: ********"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600"
        >
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Ainda não tem uma conta?{" "}
        <Link
          to="/cadastro"
          className="text-emerald-600 font-semibold"
        >
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  );
}