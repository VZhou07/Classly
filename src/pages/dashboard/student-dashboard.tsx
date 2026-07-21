import { useEffect, useState } from "react";
import { useGetIdentity, useLink, useList } from "@refinedev/core";
import { BookOpen, GraduationCap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { fetchDashboardSummary } from "@/lib/api";
import { formatGrade } from "@/lib/grades";
import { toClassScheduleSlot, type ClassListItem, type Identity } from "@/types";
import { StatCard } from "./components/stat-card";
import { ClassCard } from "./components/class-card";

export function StudentDashboard() {
  const { data: identity } = useGetIdentity<Identity>();
  const Link = useLink();
  const [summary, setSummary] = useState<{
    enrolledClassCount: number;
    gradesSummary: Array<{
      classId: number;
      className: string;
      overallGrade: number | null;
    }>;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const { query: classesQuery } = useList<ClassListItem>({
    resource: "classes",
    pagination: { pageSize: 12 },
    filters: identity?.id
      ? [{ field: "studentId", operator: "eq", value: identity.id }]
      : [],
    queryOptions: { enabled: !!identity?.id },
  });

  useEffect(() => {
    setSummaryLoading(true);
    fetchDashboardSummary()
      .then((data) => {
        if ("enrolledClassCount" in data) {
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
      })
      .finally(() => setSummaryLoading(false));
  }, []);

  const classes = classesQuery.data?.data ?? [];
  const isLoading = classesQuery.isLoading;

  const allSchedules = classes.flatMap((c) =>
    (c.schedules ?? []).map((s) => ({
      ...s,
      className: c.name,
    })),
  );

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Welcome back, {identity?.name ?? "Student"}</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard
          title="Enrolled classes"
          value={summary?.enrolledClassCount ?? classes.length}
          icon={GraduationCap}
        />
        <StatCard
          title="Published grades"
          value={
            summary?.gradesSummary.filter((g) => g.overallGrade !== null)
              .length ?? 0
          }
          icon={BookOpen}
          description="Classes with at least one published grade"
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/join-class">
                <LogIn className="mr-2 h-4 w-4" />
                Join a class
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My classes</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading classes...</p>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You are not enrolled in any classes yet.{" "}
              <Link to="/join-class" className="text-primary underline">
                Join a class
              </Link>{" "}
              to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <ClassCard
                key={c.id}
                id={c.id}
                name={c.name}
                subjectName={c.subject?.name}
                teacherName={c.teacher?.name}
                schedules={(c.schedules ?? []).map(toClassScheduleSlot)}
              />
            ))}
          </div>
        )}
      </section>

      {allSchedules.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Schedule</h2>
          <Card>
            <CardContent className="py-4">
              <ul className="space-y-2">
                {allSchedules.map((slot, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{slot.day}</span>{" "}
                    {(slot.start ?? slot.startTime) &&
                      (slot.end ?? slot.endTime) && (
                        <>
                          {(slot.start ?? slot.startTime)} –{" "}
                          {(slot.end ?? slot.endTime)}
                        </>
                      )}{" "}
                    <span className="text-muted-foreground">
                      ({slot.className})
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Grades at a glance</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/grades">View all grades</Link>
          </Button>
        </div>
        {summaryLoading ? (
          <p className="text-muted-foreground">Loading grades...</p>
        ) : summaryError ? (
          <Card>
            <CardContent className="py-6 text-destructive text-center">
              {summaryError}
            </CardContent>
          </Card>
        ) : !summary?.gradesSummary.length ? (
          <Card>
            <CardContent className="py-6 text-muted-foreground text-center">
              No published grades yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {summary.gradesSummary.map((g) => (
              <Card key={g.classId}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{g.className}</p>
                    <p className="text-sm text-muted-foreground">
                      Overall: {formatGrade(g.overallGrade)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/grades/${g.classId}`}>Breakdown</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </ListView>
  );
}
