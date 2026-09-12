export type UserRole = "ADMIN" | "BRAND" | "SELLER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}
