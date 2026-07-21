import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useLink, useShow } from "@refinedev/core";
import { RequireRole } from "@/components/require-role";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchClassEnrollments } from "@/lib/api";
import type { EnrolledStudent } from "@/types";

function AdminClassGradesContent() {
  const { classId } = useParams();
  const id = Number(classId);
  const Link = useLink();
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { query: classQuery } = useShow({
    resource: "classes",
    id: classId,
  });
  const classData = classQuery.data?.data;

  useEffect(() => {
    if (isNaN(id)) {
      setError("Invalid class ID");
      setLoading(false);
      return;
    }

    fetchClassEnrollments(id)
      .then(setStudents)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load students"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || classQuery.isLoading) {
    return (
      <ListView>
        <p className="text-muted-foreground py-12 text-center">Loading...</p>
      </ListView>
    );
  }

  if (error || classQuery.isError) {
    const classErrorMessage =
      (classQuery.error as { message?: string } | null)?.message ??
      "Failed to load class";

    return (
      <ListView>
        <p className="text-destructive py-12 text-center">
          {error ?? classErrorMessage}
        </p>
      </ListView>
    );
  }

  return (
    <ListView>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{classData?.name ?? "Class"}</h1>
          <p className="text-muted-foreground">Select a student to view grades</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/grades">Back to classes</Link>
        </Button>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No students enrolled in this class.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={`/grades/class/${id}/student/${student.studentId}`}
                        >
                          View grades
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </ListView>
  );
}

export default function AdminClassGrades() {
  return (
    <RequireRole roles={["admin"]}>
      <AdminClassGradesContent />
    </RequireRole>
  );
}
