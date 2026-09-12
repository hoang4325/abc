import { apiClient } from "@/lib/api/client";
import {
  User,
  AuthResponseData,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/types/auth";

export const authService = {
  async login(input: LoginInput): Promise<AuthResponseData> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponseData }>(
      "/auth/login",
      input,
    );
    return res.data;
  },

  async register(input: RegisterInput): Promise<AuthResponseData> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponseData }>(
      "/auth/register",
      input,
    );
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<{ success: boolean; data: User }>("/auth/me");
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post<{ success: boolean }>("/auth/logout");
  },

  async forgotPassword(
    input: ForgotPasswordInput,
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; data?: { success: boolean; message: string }; message?: string }>(
      "/auth/forgot-password",
      input,
    );
    return {
      success: res.success,
      message: (res.data?.message || res.message) ?? "Đã gửi hướng dẫn đặt lại mật khẩu",
    };
  },

  async resetPassword(
    input: ResetPasswordInput,
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; data?: { success: boolean; message: string }; message?: string }>(
      "/auth/reset-password",
      input,
    );
    return {
      success: res.success,
      message: (res.data?.message || res.message) ?? "Mật khẩu đã được đặt lại thành công",
    };
  },
};
