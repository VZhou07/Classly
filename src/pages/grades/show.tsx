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

function GradesShowContent() {
  const { classId } = useParams();
  const Link = useLink();
  const [breakdown, setBreakdown] = useState<GradeBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(classId);
    if (isNaN(id)) {
      setError("Invalid class ID");
      setLoading(false);
      return;
    }

    fetchClassGrades(id)
      .then(setBreakdown)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [classId]);

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

  return (
    <ListView>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{breakdown.className}</h1>
          <p className="text-muted-foreground">Grade breakdown</p>
        </div>
        <Button asChild>
          <Link to="/grades">Back to grades</Link>
        </Button>
      </div>

      <GradeBreakdownTable
        items={breakdown.items}
        grades={breakdown.grades}
        overallGrade={breakdown.overallGrade}
        scoreColumnLabel="Your score"
        emptyMessage="No published grades for this class yet."
      />
    </ListView>
  );
}

export default function GradesShow() {
  return (
    <RequireRole roles={["student"]}>
      <GradesShowContent />
    </RequireRole>
  );
}
