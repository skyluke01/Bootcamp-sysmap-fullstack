import type {
  RegisterBody,
  RegisterResponse,
  SignInBody,
  SignInResponse,
} from "../types/auth";

import { apiRequest } from "./api";

export function signIn(data: SignInBody) {
  return apiRequest<SignInResponse>(
    "/auth/sign-in",
    {
      method: "POST",
      body: data,
    },
  );
}

export function registerUser(
  data: RegisterBody,
) {
  return apiRequest<RegisterResponse>(
    "/auth/register",
    {
      method: "POST",
      body: data,
    },
  );
}