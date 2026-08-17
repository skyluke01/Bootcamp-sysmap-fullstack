import type { SignInResponse } from "../types/auth";

export function getUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  return JSON.parse(user) as SignInResponse;
}