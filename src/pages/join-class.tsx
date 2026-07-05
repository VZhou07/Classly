import { useState } from "react";
import { useNavigate } from "react-router";
import { useNotification } from "@refinedev/core";

import { RequireRole } from "@/components/require-role";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
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
import { BACKEND_BASE_URL } from "@/constants";

const JoinClass = () => {
  return (
    <RequireRole roles={["student"]}>
      <JoinClassContent />
    </RequireRole>
  );
};

const JoinClassContent = () => {
  const { open } = useNotification();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}classes/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? "Failed to join class");
      }

      const payload = await response.json();

      open?.({
        type: "success",
        message: "You're in!",
        description: `You've joined ${payload.data?.class?.name ?? "the class"}.`,
      });
      navigate("/");
    } catch (error) {
      open?.({
        type: "error",
        message: "Couldn't join class",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb />
      <h1 className="page-title">Join a class</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Enter an invite code</CardTitle>
          <CardDescription>
            Ask your teacher for the class invite code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="inviteCode">Invite code</Label>
              <Input
                id="inviteCode"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Joining..." : "Join class"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinClass;
