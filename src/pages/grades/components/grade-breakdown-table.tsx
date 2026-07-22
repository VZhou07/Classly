import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatGrade } from "@/lib/grades";
import type { GradeItem, StudentGrade } from "@/types";

type GradeBreakdownTableProps = {
  items: GradeItem[];
  grades: StudentGrade[];
  overallGrade: number | null;
  scoreColumnLabel?: string;
  showUnpublished?: boolean;
  emptyMessage?: string;
};

export function GradeBreakdownTable({
  items,
  grades,
  overallGrade,
  scoreColumnLabel = "Score",
  showUnpublished = false,
  emptyMessage = "No grades for this class yet.",
}: GradeBreakdownTableProps) {
  const rows = items
    .map((item) => {
      const grade = grades.find((g) => g.gradeItemId === item.id);
      if (!grade) return null;
      if (!showUnpublished && !grade.published) return null;
      const contribution = (grade.score * item.weight) / 100;
      return { item, grade, contribution };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment</TableHead>
              <TableHead className="text-right">{scoreColumnLabel}</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">Contribution</TableHead>
              {showUnpublished && <TableHead className="text-right">Status</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ item, grade, contribution }) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  {grade.score.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">{item.weight}%</TableCell>
                <TableCell className="text-right">
                  {contribution.toFixed(1)}%
                </TableCell>
                {showUnpublished && (
                  <TableCell className="text-right">
                    <Badge variant={grade.published ? "default" : "secondary"}>
                      {grade.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={showUnpublished ? 4 : 3}
                className="font-semibold"
              >
                Overall weighted grade
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatGrade(overallGrade)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
