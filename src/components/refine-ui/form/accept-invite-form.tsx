"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { InputPassword } from "@/components/refine-ui/form/input-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BACKEND_BASE_URL } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { useNotification, useRefineOptions } from "@refinedev/core";

type InviteDetails = {
  email: string;
  role: "teacher" | "student";
  className?: string;
};

export const AcceptInviteForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { title } = useRefineOptions();
  const { open } = useNotification();

  const [status, setStatus] = useState<"loading" | "valid" | "invalid">(
    "loading"
  );
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    fetch(`${BACKEND_BASE_URL}invites/${token}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("invalid");
        }
        const payload: { data: InviteDetails } = await response.json();
        setInvite(payload.data);
        setStatus("valid");
      })
      .catch(() => {
        setStatus("invalid");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!invite) return;

    if (password !== confirmPassword) {
      open?.({
        type: "error",
        message: "Passwords don't match",
        description:
          "Please make sure both password fields contain the same value.",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await authClient.signUp.email({
      email: invite.email,
      password,
      name,
    });

    setSubmitting(false);

    if (error) {
      open?.({
        type: "error",
        message: "Couldn't create your account",
        description: error.message ?? "Please try again.",
      });
      return;
    }

    open?.({
      type: "success",
      message: "Account created",
      description: "Welcome aboard!",
    });
    navigate("/");
  };

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "px-6",
        "py-8",
        "min-h-svh"
      )}
    >
      <div className={cn("flex", "items-center", "justify-center", "gap-2")}>
        {title.icon && (
          <div
            className={cn("text-foreground", "[&>svg]:w-12", "[&>svg]:h-12")}
          >
            {title.icon}
          </div>
        )}
      </div>

      <Card className={cn("sm:w-[456px]", "p-12", "mt-6")}>
        <CardHeader className={cn("px-0")}>
          <CardTitle
            className={cn(
              "text-green-600",
              "dark:text-green-400",
              "text-3xl",
              "font-semibold"
            )}
          >
            Accept invite
          </CardTitle>
          {status === "valid" && invite && (
            <CardDescription
              className={cn("text-muted-foreground", "font-medium")}
            >
              You've been invited to join as a {invite.role}
              {invite.className ? ` for "${invite.className}"` : ""}.
            </CardDescription>
          )}
          {status === "invalid" && (
            <CardDescription
              className={cn("text-muted-foreground", "font-medium")}
            >
              This invite link is invalid or has expired. Ask whoever invited
              you to send a new one.
            </CardDescription>
          )}
        </CardHeader>

        <Separator />

        {status === "valid" && invite && (
          <CardContent className={cn("px-0")}>
            <form onSubmit={handleSubmit}>
              <div className={cn("flex", "flex-col", "gap-2")}>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={invite.email} disabled />
              </div>

              <div className={cn("flex", "flex-col", "gap-2", "mt-6")}>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div
                className={cn(
                  "relative",
                  "flex",
                  "flex-col",
                  "gap-2",
                  "mt-6"
                )}
              >
                <Label htmlFor="password">Password</Label>
                <InputPassword
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div
                className={cn(
                  "relative",
                  "flex",
                  "flex-col",
                  "gap-2",
                  "mt-6"
                )}
              >
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <InputPassword
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className={cn("w-full", "mt-6")}
                disabled={submitting}
              >
                {submitting ? "Creating account..." : "Accept invite"}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

AcceptInviteForm.displayName = "AcceptInviteForm";
