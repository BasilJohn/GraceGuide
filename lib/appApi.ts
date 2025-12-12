import {
    AppleAuthResponse,
    GoogleAuthResponse,
    User,
} from "@/types/types";
import api from "./api";

export async function loginWithGoogle(
  token: string
): Promise<GoogleAuthResponse> {
  const response = await api.post<GoogleAuthResponse>(
    `auth/google`,
    { idToken: token },
    { skipAuth: true } // skip adding Authorization
  );
  return response.data;
}

export async function loginWithApple(
  token: string
): Promise<AppleAuthResponse> {
  const response = await api.post<AppleAuthResponse>(
    `auth/apple`,
    { identityToken: token },
    { skipAuth: true } // same idea — skip adding Authorization
  );
  return response.data;
}

export async function getUser(): Promise<User> {
  const response = await api.get<User>(`auth/getUser`);
  return response.data;
}

export async function deleteUserAccount(): Promise<void> {
  await api.delete(`auth/me`);
}

