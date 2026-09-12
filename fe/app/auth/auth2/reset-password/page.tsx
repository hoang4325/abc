"use client";

import React, { useState, Suspense } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FullLogo from "@/app/(dashboard-layout)/layout/shared/logo/full-logo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/services/auth.service";
import { useToast } from "@/components/ui/toast-simple";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Mã đặt lại mật khẩu không hợp lệ hoặc bị thiếu.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.resetPassword({ token, newPassword });
      setSuccess(true);
      showToast(res.message, "success");
    } catch (err: any) {
      const msg = err?.message || "Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="md:w-112.5 w-full border-none shadow-lg p-6">
      <div className="mx-auto w-fit">
        <FullLogo />
      </div>
      <h2 className="text-xl font-semibold text-center mt-4">Đặt lại mật khẩu</h2>
      <p className="text-sm font-normal text-muted-foreground my-2 text-center">
        Nhập mật khẩu mới cho tài khoản của bạn.
      </p>

      {success ? (
        <div className="space-y-4 my-4">
          <div className="flex items-center gap-2 rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Mật khẩu đã được cập nhật thành công!</span>
          </div>
          <Link
            href="/auth/auth2/login"
            className="flex items-center justify-center w-full h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!token && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-amber-500/15 p-3 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Không tìm thấy token đặt lại mật khẩu trong đường dẫn.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="space-y-1.5">
              <Label
                htmlFor="newPassword"
                className="text-sm font-normal text-muted-foreground"
              >
                Mật khẩu mới*
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading || !token}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-normal text-muted-foreground"
              >
                Xác nhận mật khẩu mới*
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Xác nhận lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || !token}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg"
              disabled={isLoading || !token}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </Button>
          </form>

          <div className="mt-4">
            <Link
              href="/auth/auth2/login"
              className="flex items-center justify-center w-full h-8 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-muted flex items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
