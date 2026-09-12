"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import SocialButtons from "../../authforms/social-buttons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FullLogo from "@/app/(dashboard-layout)/layout/shared/logo/full-logo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/context/auth-context";
import { useToast } from "@/components/ui/toast-simple";
import { AlertCircle } from "lucide-react";

export default function BoxedRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password });
      showToast("Tạo tài khoản thành công!", "success");
      window.location.href = "/";
    } catch (err: any) {
      const msg = err?.message || "Đăng ký thất bại. Vui lòng thử lại.";
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

        <SocialButtons />

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
                htmlFor="name"
                className="text-sm font-normal text-muted-foreground"
              >
                Name*
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
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
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-normal text-muted-foreground"
              >
                Password*
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
          </Button>
        </form>

        <div className="flex gap-2 text-base text-muted-foreground font-medium mt-4 items-center justify-center">
          <p>Already have an Account?</p>
          <Link
            href="/auth/auth2/login"
            className="text-primary/80 text-base hover:text-primary font-medium"
          >
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
