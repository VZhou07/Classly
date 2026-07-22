import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLink } from "@refinedev/core";
import type { ClassScheduleSlot } from "@/types";

type ClassCardProps = {
  id: number;
  name: string;
  subjectName?: string;
  teacherName?: string;
  enrollmentCount?: number;
  capacity?: number;
  schedules?: ClassScheduleSlot[];
};

export function ClassCard({
  id,
  name,
  subjectName,
  teacherName,
  enrollmentCount,
  capacity,
  schedules = [],
}: ClassCardProps) {
  const Link = useLink();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        {subjectName && (
          <Badge variant="secondary" className="w-fit">
            {subjectName}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {teacherName && (
          <p className="text-sm text-muted-foreground">
            Instructor: {teacherName}
          </p>
        )}
        {enrollmentCount !== undefined && capacity !== undefined && (
          <p className="text-sm">
            Enrolled: {enrollmentCount} / {capacity}
          </p>
        )}
        {schedules.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Schedule</p>
            <ul className="space-y-1">
              {schedules.slice(0, 3).map((slot, i) => (
                <li key={i}>
                  {slot.day}: {slot.start} – {slot.end}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button
          size="sm"
          className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
          asChild
        >
          <Link to={`/classes/show/${id}`}>View class</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
