import { useState, type SubmitEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { Eye, EyeOff, Film, Lock, Mail } from "lucide-react";

import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";
import { loginSchema } from "../validations/loginValidation";
import type { LoginPayload } from "../types/authTypes";

import { Button } from "#/shared/components/ui/button";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import {
  getFormValidationErrors,
  type FormValidationErrors,
} from "#/shared/utils/getFormValidationErrors";
import type { ApiErrorResponse } from "#/shared/types";

type LoginErrors = FormValidationErrors<LoginPayload>;

const initialPayload: LoginPayload = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [loginCredential, setLoginCredentials] = useState<LoginPayload>(initialPayload);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const loginUser = useAuthStore((state) => state.login);

  function updateField(field: keyof LoginPayload, value: string) {
    setLoginCredentials((currentPayload) => ({ ...currentPayload, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = loginSchema.safeParse(loginCredential);

    if (!validation.success) {
      const errors = getFormValidationErrors(validation.error);
      setErrors(errors);
      return;
    }

    setErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.login(validation.data);
      const user = response.data.user;

      if (user.role === "customer") {
        await authApi.logout();
        setFormError("This account does not have access to the admin dashboard.");
        return;
      }

      loginUser(user);

      void navigate({ to: "/dashboard" });
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-background flex min-h-screen">
      <section className="bg-secondary text-secondary-foreground hidden w-full max-w-xl flex-col justify-between border-r p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
            <Film className="size-5" />
          </div>

          <div>
            <p className="text-lg font-semibold">977Cinema</p>
            <p className="text-secondary-foreground/70 text-sm">Admin Dashboard</p>
          </div>
        </div>

        <div className="max-w-md">
          <p className="text-secondary-foreground/70 text-sm font-medium">Operations console</p>

          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            Manage movies, venues, shows, and bookings from one place.
          </h1>

          <p className="text-secondary-foreground/75 mt-5 text-base leading-7">
            Sign in to access admin tools for the 977Cinema ticketing platform.
          </p>
        </div>

        <p className="text-secondary-foreground/60 text-sm">
          Secure access for authorized cinema administrators.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
              <Film className="size-5" />
            </div>

            <div>
              <p className="text-lg font-semibold">977Cinema</p>
              <p className="text-muted text-sm">Admin Dashboard</p>
            </div>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">Sign in</h2>
              <p className="text-muted mt-2 text-sm">Enter your admin credentials to continue.</p>
            </div>

            <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

                <div className="relative">
                  <Mail className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={Boolean(errors.email)}
                    autoComplete="email"
                    className="pl-9"
                    disabled={isSubmitting}
                    id="email"
                    name="email"
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="admin@977cinema.com"
                    type="email"
                    value={loginCredential.email}
                  />
                </div>

                {errors.email ? (
                  <p className="text-destructive text-sm" id="email-error">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Password</Label>
                  {/* <button
                    className="text-primary hover:text-primary/80 focus-visible:ring-ring text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
                    type="button"
                  >
                    Forgot password?
                  </button> */}
                </div>

                <div className="relative">
                  <Lock className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    aria-describedby={errors.password ? "password-error" : undefined}
                    aria-invalid={Boolean(errors.password)}
                    autoComplete="current-password"
                    className="pr-10 pl-9"
                    disabled={isSubmitting}
                    id="password"
                    name="password"
                    onChange={(event) => updateField("password", event.target.value)}
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                    value={loginCredential.password}
                  />

                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-muted hover:bg-surface-muted hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword((isVisible) => !isVisible)}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {errors.password ? (
                  <p className="text-destructive text-sm" id="password-error">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              {formError ? (
                <p className="text-destructive text-sm" role="alert">
                  {formError}
                </p>
              ) : null}

              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function getLoginErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return axiosError.response?.data.error.message ?? "Unable to sign in. Please try again.";
}
