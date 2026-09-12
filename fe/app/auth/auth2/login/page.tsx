"use client";

import React, { useState, Suspense } from "react";
import { Card } from "@/components/ui/card";
import SocialButtons from "../../authforms/social-buttons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import FullLogo from "@/app/(dashboard-layout)/layout/shared/logo/full-logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/auth-context";
import { useToast } from "@/components/ui/toast-simple";
import { AlertCircle } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password, rememberMe });
      showToast("Đăng nhập thành công!", "success");
      window.location.href = redirectUrl;
    } catch (err: any) {
      const msg = err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-none shadow-lg p-6">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                disabled={isLoading}
                className="cursor-pointer"
              />
              <Label
                htmlFor="remember"
                className="text-muted-foreground font-normal cursor-pointer leading-0"
              >
                Remember this device
              </Label>
            </div>
            <Link
              href="/auth/auth2/forgot-password"
              className="text-sm font-medium hover:underline underline-offset-4 transition-all"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? "Đang đăng nhập..." : "Sign in"}
        </Button>
      </form>

      <div className="flex gap-2 text-base font-medium mt-4 items-center justify-center">
        <p className="text-muted-foreground">New to ShareDeal?</p>
        <Link
          href="/auth/auth2/register"
          className="text-primary/80 hover:text-primary text-sm font-medium"
        >
          Create an account
        </Link>
      </div>
    </Card>
  );
}

export default function BoxedLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent px-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
