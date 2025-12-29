"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Lock, User, AlertCircle, Eye, EyeOff, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { DocTrackLogoWithIcon } from "@/assets/doctrack-logo";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Prevenir erro de hidratação garantindo que o conteúdo traduzido só seja renderizado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Translates technical error messages to user-friendly messages
  const getErrorMessage = (errorMsg: string): string => {
    const lowerError = errorMsg.toLowerCase();

    if (
      lowerError.includes("invalid") ||
      lowerError.includes("401") ||
      lowerError.includes("incorrect")
    ) {
      return t("login.error.invalidCredentials");
    }
    if (
      lowerError.includes("network") ||
      lowerError.includes("fetch") ||
      lowerError.includes("connection")
    ) {
      return t("login.error.connectionError");
    }
    if (lowerError.includes("500") || lowerError.includes("server")) {
      return t("login.error.serverError");
    }
    if (lowerError.includes("timeout")) {
      return t("login.error.timeout");
    }

    return t("login.error.generic");
  };

  const validateFields = () => {
    const username = usernameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";
    const errors: { username?: string; password?: string } = {};

    if (!username) {
      errors.username = t("login.validation.usernameRequired");
    }
    if (!password) {
      errors.password = t("login.validation.passwordRequired");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateFields()) {
      return;
    }

    const username = usernameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";

    setIsPending(true);

    try {
      await login(username, password);
      router.push("/");
    } catch (err: any) {
      setError(getErrorMessage(err.message || ""));
    } finally {
      setIsPending(false);
    }
  };

  const clearFieldError = (field: "username" | "password") => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex-1 flex items-center justify-center p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-2"
            >
              <DocTrackLogoWithIcon
                className="text-foreground"
                width={300}
                height={50}
              />
            </motion.div>
            <p className="text-muted-foreground text-sm font-medium">
              {mounted ? tCommon("appDescription") : "Document Management System"}
            </p>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">{mounted ? t("login.title") : "Sign in"}</CardTitle>
              <CardDescription>{mounted ? t("login.description") : "Enter your credentials to access the system"}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">
                        {mounted ? t("login.error.title") : "Sign in failed"}
                      </p>
                      <p className="text-sm text-destructive/80 mt-0.5">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">{mounted ? t("login.username") : "Username"}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      ref={usernameRef}
                      data-testid="input-username"
                      type="text"
                      placeholder={mounted ? t("login.usernamePlaceholder") : "Enter your username"}
                      className={`pl-10 ${
                        fieldErrors.username
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      autoComplete="username"
                      onChange={() => clearFieldError("username")}
                    />
                  </div>
                  {fieldErrors.username && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1.5"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {fieldErrors.username}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{mounted ? t("login.password") : "Password"}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      ref={passwordRef}
                      data-testid="input-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={mounted ? t("login.passwordPlaceholder") : "Enter your password"}
                      className={`pl-10 pr-10 ${
                        fieldErrors.password
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      autoComplete="current-password"
                      onChange={() => clearFieldError("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1.5"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {fieldErrors.password}
                    </motion.p>
                  )}
                </div>

                <Button
                  type="submit"
                  data-testid="button-login"
                  className="w-full"
                  disabled={isPending || isLoading}
                >
                  {isPending || isLoading ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      {mounted ? t("login.submitting") : "Signing in..."}
                    </>
                  ) : (
                    mounted ? t("login.submit") : "Sign in"
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  {mounted ? t("login.credentials.title") : "Access credentials:"}
                </p>
                <div className="space-y-2.5 text-sm">
                  <div className="p-2.5 rounded-md bg-muted/50">
                    <p className="font-medium text-foreground mb-1">
                      {mounted ? t("login.credentials.admin.title") : "Administrator"}
                    </p>
                    <p className="text-muted-foreground text-xs mb-1.5">
                      {mounted ? t("login.credentials.admin.description") : "Full access to the system: create, edit and manage documents and users"}
                    </p>
                    <p className="font-mono text-xs">
                      <span className="text-muted-foreground">
                        {mounted ? t("login.credentials.admin.userLabel") : "User:"}
                      </span> admin | <span className="text-muted-foreground">
                        {mounted ? t("login.credentials.admin.passwordLabel") : "Password:"}
                      </span> admin123
                    </p>
                  </div>
                  <div className="p-2.5 rounded-md bg-muted/50">
                    <p className="font-medium text-foreground mb-1">
                      {mounted ? t("login.credentials.editor.title") : "Editor"}
                    </p>
                    <p className="text-muted-foreground text-xs mb-1.5">
                      {mounted ? t("login.credentials.editor.description") : "Can create and edit documents, but does not manage users"}
                    </p>
                    <p className="font-mono text-xs">
                      <span className="text-muted-foreground">
                        {mounted ? t("login.credentials.admin.userLabel") : "User:"}
                      </span> editor | <span className="text-muted-foreground">
                        {mounted ? t("login.credentials.admin.passwordLabel") : "Password:"}
                      </span> editor123
                    </p>
                  </div>
                  <div className="p-2.5 rounded-md bg-muted/50">
                    <p className="font-medium text-foreground mb-1">
                      {mounted ? t("login.credentials.reader.title") : "Reader"}
                    </p>
                    <p className="text-muted-foreground text-xs mb-1.5">
                      {mounted ? t("login.credentials.reader.description") : "Only document viewing, no permission to edit"}
                    </p>
                    <p className="font-mono text-xs">
                      <span className="text-muted-foreground">
                        {mounted ? t("login.credentials.admin.userLabel") : "User:"}
                      </span> reader | <span className="text-muted-foreground">
                        {mounted ? t("login.credentials.admin.passwordLabel") : "Password:"}
                      </span> reader123
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/30">
                  <a
                    href="https://github.com/mmancilha/DocTrack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>{mounted ? t("login.credentials.github") : "GitHub"}</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        Made with <span className="text-red-500">❤️</span> by{" "}
        <a
          href="https://www.linkedin.com/in/mayconmancilha/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          Maycon Mancilha
        </a>
        <span className="mx-1">•</span>
        <span className="text-muted-foreground/80">Software Engineer</span>
      </footer>
    </div>
  );
}

