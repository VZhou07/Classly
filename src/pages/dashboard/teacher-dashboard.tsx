import { useEffect, useState } from "react";
import { useGetIdentity, useLink, useList } from "@refinedev/core";
import { GraduationCap, Mail, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { fetchDashboardSummary } from "@/lib/api";
import {
  toClassScheduleSlot,
  type ClassListItem,
  type Identity,
  type Invitation,
} from "@/types";
import { StatCard } from "./components/stat-card";
import { ClassCard } from "./components/class-card";

export function TeacherDashboard() {
  const { data: identity } = useGetIdentity<Identity>();
  const Link = useLink();
  const [summary, setSummary] = useState<{
    classCount: number;
    totalStudents: number;
    pendingInviteCount: number;
  } | null>(null);

  const { query: classesQuery } = useList<ClassListItem>({
    resource: "classes",
    pagination: { pageSize: 12 },
    filters: identity?.id
      ? [
          { field: "teacherId", operator: "eq", value: identity.id },
          {
            field: "includeEnrollmentCount",
            operator: "eq",
            value: "true",
          },
        ]
      : [],
    queryOptions: { enabled: !!identity?.id },
  });

  const { query: invitesQuery } = useList<Invitation>({
    resource: "invites",
    pagination: { pageSize: 5 },
    filters: [{ field: "status", operator: "eq", value: "pending" }],
    queryOptions: { enabled: !!identity?.id },
  });

  useEffect(() => {
    fetchDashboardSummary()
      .then((data) => {
        if ("classCount" in data && "totalStudents" in data) {
          setSummary(data);
        }
      })
      .catch(console.error);
  }, []);

  const classes = classesQuery.data?.data ?? [];
  const pendingInvites = invitesQuery.data?.data ?? [];

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Welcome back, {identity?.name ?? "Teacher"}</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard
          title="My classes"
          value={summary?.classCount ?? classes.length}
          icon={GraduationCap}
        />
        <StatCard
          title="Total students"
          value={
            summary?.totalStudents ??
            classes.reduce((sum, c) => sum + (c.enrollmentCount ?? 0), 0)
          }
          icon={Users}
        />
        <StatCard
          title="Pending invites"
          value={summary?.pendingInviteCount ?? pendingInvites.length}
          icon={Mail}
        />
      </div>

      <div className="flex gap-2 mb-8">
        <Button asChild>
          <Link to="/invites/create">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite student
          </Link>
        </Button>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My classes</h2>
        {classesQuery.isLoading ? (
          <p className="text-muted-foreground">Loading classes...</p>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You are not assigned to any classes yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <div key={c.id} className="flex flex-col gap-2">
                <ClassCard
                  id={c.id}
                  name={c.name}
                  subjectName={c.subject?.name}
                  enrollmentCount={c.enrollmentCount}
                  capacity={c.capacity}
                  schedules={(c.schedules ?? []).map(toClassScheduleSlot)}
                />
                <Button
                  size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <Link to={`/classes/show/${c.id}/grades`}>Manage grades</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent pending invites</h2>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <Link to="/invites">View all</Link>
          </Button>
        </div>
        {pendingInvites.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              No pending invites.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <Card key={invite.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    {invite.className && (
                      <p className="text-sm text-muted-foreground">
                        Class: {invite.className}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">{invite.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </ListView>
  );
}
