import { useEffect, useState } from "react";
import { useLink, useList } from "@refinedev/core";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Mail,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { fetchDashboardSummary } from "@/lib/api";
import type { Invitation } from "@/types";
import { StatCard } from "./components/stat-card";

export function AdminDashboard() {
  const Link = useLink();
  const [summary, setSummary] = useState<{
    userCounts: { student: number; teacher: number; admin: number };
    classCount: number;
    subjectCount: number;
    pendingInviteCount: number;
  } | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const { query: invitesQuery } = useList<Invitation>({
    resource: "invites",
    pagination: { pageSize: 8 },
  });

  useEffect(() => {
    fetchDashboardSummary()
      .then((data) => {
        if ("userCounts" in data) {
          setSummary(data);
          setSummaryError(null);
        } else {
          setSummary(null);
          setSummaryError("Failed to load dashboard summary");
        }
      })
      .catch((e) => {
        console.error(e);
        setSummary(null);
        setSummaryError(
          e instanceof Error ? e.message : "Failed to load dashboard summary",
        );
      });
  }, []);

  const recentInvites = invitesQuery.data?.data ?? [];

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Admin dashboard</h1>

      {summaryError && (
        <p className="text-destructive mb-4">{summaryError}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Students"
          value={summary?.userCounts.student ?? 0}
          icon={Users}
        />
        <StatCard
          title="Teachers"
          value={summary?.userCounts.teacher ?? 0}
          icon={GraduationCap}
        />
        <StatCard
          title="Classes"
          value={summary?.classCount ?? 0}
          icon={BookOpen}
        />
        <StatCard
          title="Pending invites"
          value={summary?.pendingInviteCount ?? 0}
          icon={Mail}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button asChild>
          <Link to="/subjects/create">Create subject</Link>
        </Button>
        <Button asChild>
          <Link to="/classes/create">Create class</Link>
        </Button>
        <Button asChild>
          <Link to="/invites/create">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite teacher
          </Link>
        </Button>
        <Button asChild>
          <Link to="/grades">
            <ClipboardList className="mr-2 h-4 w-4" />
            View student grades
          </Link>
        </Button>
      </div>

      {summary && (
        <p className="text-sm text-muted-foreground mb-6">
          {summary.subjectCount} subjects across the organization
        </p>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent invites</h2>
          <Button size="sm" asChild>
            <Link to="/invites">View all</Link>
          </Button>
        </div>
        {invitesQuery.isLoading ? (
          <p className="text-muted-foreground">Loading invites...</p>
        ) : recentInvites.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              No invites yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentInvites.map((invite) => (
              <Card key={invite.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {invite.role}
                      {invite.className ? ` · ${invite.className}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      invite.status === "pending" ? "secondary" : "outline"
                    }
                  >
                    {invite.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </ListView>
  );
}
