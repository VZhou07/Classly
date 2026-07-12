import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useLink } from "@refinedev/core";
import { RequireRole } from "@/components/require-role";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import { fetchClassGrades } from "@/lib/api";
import type { GradeBreakdown } from "@/types";
import { GradeBreakdownTable } from "./components/grade-breakdown-table";

function AdminStudentGradesContent() {
  const { classId, studentId } = useParams();
  const id = Number(classId);
  const Link = useLink();
  const [breakdown, setBreakdown] = useState<GradeBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(id) || !studentId) {
      setError("Invalid class or student ID");
      setLoading(false);
      return;
    }

    fetchClassGrades(id, studentId)
      .then(setBreakdown)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load grades"),
      )
      .finally(() => setLoading(false));
  }, [id, studentId]);

  if (loading) {
    return (
      <ListView>
        <p className="text-muted-foreground py-12 text-center">Loading grades...</p>
      </ListView>
    );
  }

  if (error || !breakdown) {
    return (
      <ListView>
        <p className="text-destructive py-12 text-center">
          {error ?? "Failed to load grades"}
        </p>
      </ListView>
    );
  }

  const studentName =
    breakdown.grades[0]?.student?.name ?? "Student";

  return (
    <ListView>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{studentName}</h1>
          <p className="text-muted-foreground">
            {breakdown.className} — grade breakdown (read-only)
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/grades/class/${id}`}>Back to students</Link>
        </Button>
      </div>

      <GradeBreakdownTable
        items={breakdown.items}
        grades={breakdown.grades}
        overallGrade={breakdown.overallGrade}
        scoreColumnLabel="Score"
        showUnpublished
        emptyMessage="No grades recorded for this student yet."
      />
    </ListView>
  );
}

export default function AdminStudentGrades() {
  return (
    <RequireRole roles={["admin"]}>
      <AdminStudentGradesContent />
    </RequireRole>
  );
}
