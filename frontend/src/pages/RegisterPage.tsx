import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Input } from "../components/Input";
import { Button } from "../components/ui/button";
import { AuthLayout } from "../layouts/AuthLayout";
import { registerUser } from "../services/authService";
import { formatCPF } from "../utils/formatCPF";
import { isValidCPF } from "../utils/isValidCPF";

const registerSchema = z.object({
  name: z.string().min(3, "Informe seu nome completo"),

  cpf: z.string().refine(isValidCPF, {
    message: "Informe um CPF válido",
  }),

  email: z.string().email("Informe um e-mail válido"),

  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function handleRegister(data: RegisterFormData) {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        password: data.password,
      });

      toast.success("Conta criada com sucesso!");

      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao criar conta.");
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
    CRIE SUA CONTA
  </h2>

  <p className="text-[16px] text-gray-600 mb-6 leading-relaxed">
    Cadastre-se para encontrar parceiros de treino e começar a se exercitar ao ar livre.
    <br />
    Vamos juntos! 💪
  </p>

  <form
    onSubmit={handleSubmit(handleRegister)}
    className="space-y-4"
  >
    <Input
      label="Nome completo"
      placeholder="Ex.: João Silva"
      error={errors.name?.message}
      {...register("name")}
    />

    <Input
      label="CPF"
      placeholder="Ex.: 123.456.789-01"
      error={errors.cpf?.message}
      value={watch("cpf") || ""}
      {...register("cpf")}
      onChange={(event) => {
        setValue("cpf", formatCPF(event.target.value));
      }}
    />

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
      placeholder="Ex.: joao123"
      error={errors.password?.message}
      {...register("password")}
    />

    <Button
      type="submit"
      className="w-full h-[46px] bg-emerald-500 hover:bg-emerald-600"
    >
      Cadastrar
    </Button>
  </form>

  <p className="text-center text-sm text-gray-500 mt-6">
    Já tem uma conta?{" "}
    <Link to="/" className="text-black font-bold">
      Faça login
    </Link>
  </p>
</AuthLayout>
  );
}