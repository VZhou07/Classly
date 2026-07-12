import { useGetIdentity } from "@refinedev/core";
import type { Identity } from "@/types";
import { StudentDashboard } from "./student-dashboard";
import { TeacherDashboard } from "./teacher-dashboard";
import { AdminDashboard } from "./admin-dashboard";

export default function Dashboard() {
  const { data: identity, isLoading } = useGetIdentity<Identity>();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  switch (identity?.role) {
    case "student":
      return <StudentDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          Unable to determine your role.
        </div>
      );
  }
}
