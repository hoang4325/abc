"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FullLogo from "@/app/(dashboard-layout)/layout/shared/logo/full-logo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/services/auth.service";
import { useToast } from "@/components/ui/toast-simple";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function BoxedForgotpwd() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword({ email });
      setSuccessMessage(res.message);
      showToast(res.message, "success");
    } catch (err: any) {
      const msg = err?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-muted flex items-center justify-center px-4 py-8">
      <Card className="md:w-112.5 w-full border-none shadow-lg p-6">
        <div className="mx-auto w-fit">
          <FullLogo />
        </div>
        <p className="text-sm font-normal text-muted-foreground my-4 text-center">
          Nhập địa chỉ email liên kết với tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
        </p>

        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-normal text-muted-foreground"
              >
                Email*
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@sharedeal.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-lg" disabled={isLoading}>
            {isLoading ? "Đang gửi..." : "Gửi yêu cầu đặt lại mật khẩu"}
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
      </Card>
    </div>
  );
}
