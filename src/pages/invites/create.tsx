import { useState } from "react";
import { useGetIdentity, useList, useNotification } from "@refinedev/core";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BACKEND_BASE_URL } from "@/constants";
import type { ClassDetails, Identity } from "@/types";

const InviteCreate = () => {
  return (
    <RequireRole roles={["admin", "teacher"]}>
      <InviteCreateContent />
    </RequireRole>
  );
};

const InviteCreateContent = () => {
  const { data: identity } = useGetIdentity<Identity>();
  const { open } = useNotification();

  const [email, setEmail] = useState("");
  const [classId, setClassId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = identity?.role === "admin";

  const { result: classesResult } = useList<ClassDetails>({
    resource: "classes",
    pagination: { pageSize: 100 },
    queryOptions: { enabled: !isAdmin },
  });

  const myClasses = (classesResult?.data ?? []).filter(
    (classItem: ClassDetails) => classItem.teacher?.id === identity?.id,
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAdmin && !classId) {
      open?.({
        type: "error",
        message: "Please select a class",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          classId: isAdmin ? undefined : Number(classId),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? "Failed to send invite");
      }

      open?.({
        type: "success",
        message: "Invite sent",
        description: `${email} will receive an email with instructions.`,
      });
      setEmail("");
      setClassId("");
    } catch (error) {
      open?.({
        type: "error",
        message: "Couldn't send invite",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb />
      <h1 className="page-title">
        Invite a {isAdmin ? "teacher" : "student"}
      </h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Send an invite</CardTitle>
          <CardDescription>
            {isAdmin
              ? "They'll receive an email to set up their teacher account."
              : "They'll receive an email to set up their student account and join the selected class."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isAdmin && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="class">Class</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger id="class" className="w-full">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {myClasses.map((classItem) => (
                      <SelectItem key={classItem.id} value={String(classItem.id)}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send invite"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteCreate;
