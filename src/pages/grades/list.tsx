import { useEffect, useMemo, useState } from "react";
import { useGetIdentity, useLink } from "@refinedev/core";
import { RequireRole } from "@/components/require-role";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useTable } from "@refinedev/react-table";
import { fetchDashboardSummary } from "@/lib/api";
import { formatGrade } from "@/lib/grades";
import type { Identity } from "@/types";

function StudentGradesList() {
  const Link = useLink();
  const [gradesSummary, setGradesSummary] = useState<
    Array<{ classId: number; className: string; overallGrade: number | null }>
  >([]);

  useEffect(() => {
    fetchDashboardSummary()
      .then((data) => {
        if ("gradesSummary" in data) {
          setGradesSummary(data.gradesSummary);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <h1 className="page-title">My grades</h1>
      <p className="text-muted-foreground mb-6">
        Weighted averages across your enrolled classes.
      </p>

      {gradesSummary.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No grades published yet. Check back once your teacher publishes
            scores.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {gradesSummary.map((g) => (
            <Card key={g.classId}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-lg">{g.className}</p>
                  <p className="text-muted-foreground">
                    Overall: {formatGrade(g.overallGrade)}
                  </p>
                </div>
                <Button asChild>
                  <Link to={`/grades/${g.classId}`}>View breakdown</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function AdminGradesClassList() {
  const Link = useLink();

  const classTable = useTable({
    columns: useMemo(
      () => [
        {
          id: "name",
          accessorKey: "name",
          header: () => <p className="column-title">Class</p>,
          cell: ({ getValue }) => (
            <span className="font-medium">{getValue<string>()}</span>
          ),
        },
        {
          id: "subject",
          accessorKey: "subject.name",
          header: () => <p className="column-title">Subject</p>,
          cell: ({ getValue }) => (
            <Badge variant="secondary">{getValue<string>()}</Badge>
          ),
        },
        {
          id: "teacher",
          accessorKey: "teacher.name",
          header: () => <p className="column-title">Teacher</p>,
          cell: ({ getValue }) => <span>{getValue<string>()}</span>,
        },
        {
          id: "enrollmentCount",
          accessorKey: "enrollmentCount",
          header: () => <p className="column-title">Students</p>,
          cell: ({ getValue }) => getValue<number>() ?? "—",
        },
        {
          id: "action",
          header: () => <p className="column-title">Action</p>,
          cell: ({ row }) => (
            <Button size="sm" asChild>
              <Link to={`/grades/class/${row.original.id}`}>View students</Link>
            </Button>
          ),
        },
      ],
      [Link],
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: [
          {
            field: "includeEnrollmentCount",
            operator: "eq",
            value: "true",
          },
        ],
      },
    },
  });

  return (
    <>
      <h1 className="page-title">Student grades</h1>
      <p className="text-muted-foreground mb-6">
        Select a class to view individual student grades (read-only).
      </p>
      <DataTable table={classTable} />
    </>
  );
}

function TeacherGradesClassList() {
  const Link = useLink();
  const { data: identity } = useGetIdentity<Identity>();

  const classTable = useTable({
    columns: useMemo(
      () => [
        {
          id: "name",
          accessorKey: "name",
          header: () => <p className="column-title">Class</p>,
          cell: ({ getValue }) => (
            <span className="font-medium">{getValue<string>()}</span>
          ),
        },
        {
          id: "subject",
          accessorKey: "subject.name",
          header: () => <p className="column-title">Subject</p>,
          cell: ({ getValue }) => (
            <Badge variant="secondary">{getValue<string>()}</Badge>
          ),
        },
        {
          id: "enrollmentCount",
          accessorKey: "enrollmentCount",
          header: () => <p className="column-title">Students</p>,
          cell: ({ getValue }) => getValue<number>() ?? "—",
        },
        {
          id: "action",
          header: () => <p className="column-title">Action</p>,
          cell: ({ row }) => (
            <Button size="sm" asChild>
              <Link to={`/classes/show/${row.original.id}/grades`}>
                Manage grades
              </Link>
            </Button>
          ),
        },
      ],
      [Link],
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: [
          {
            field: "teacherId",
            operator: "eq",
            value: identity?.id,
          },
          {
            field: "includeEnrollmentCount",
            operator: "eq",
            value: "true",
          },
        ],
      },
      queryOptions: { enabled: !!identity?.id },
    },
  });

  return (
    <>
      <h1 className="page-title">Class grades</h1>
      <p className="text-muted-foreground mb-6">
        Open a class gradebook to add assignments and publish scores.
      </p>
      <DataTable table={classTable} />
    </>
  );
}

function GradesListContent() {
  const { data: identity, isLoading } = useGetIdentity<Identity>();

  if (isLoading) {
    return (
      <p className="text-muted-foreground py-12 text-center">Loading...</p>
    );
  }

  return (
    <ListView>
      <Breadcrumb />
      {identity?.role === "admin" ? (
        <AdminGradesClassList />
      ) : identity?.role === "teacher" ? (
        <TeacherGradesClassList />
      ) : (
        <StudentGradesList />
      )}
    </ListView>
  );
}

export default function GradesList() {
  return (
    <RequireRole roles={["student", "teacher", "admin"]}>
      <GradesListContent />
    </RequireRole>
  );
}
