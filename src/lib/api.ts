import { BACKEND_BASE_URL } from "@/constants";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) message = payload.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export type DashboardSummary =
  | {
      enrolledClassCount: number;
      gradesSummary: Array<{
        classId: number;
        className: string;
        overallGrade: number | null;
      }>;
    }
  | {
      classCount: number;
      totalStudents: number;
      pendingInviteCount: number;
    }
  | {
      userCounts: { student: number; teacher: number; admin: number };
      classCount: number;
      subjectCount: number;
      pendingInviteCount: number;
    };

export async function fetchDashboardSummary() {
  const payload = await apiFetch<{ data: DashboardSummary }>(
    "dashboard/summary",
  );
  return payload.data;
}

export type GradeItem = {
  id: number;
  classId: number;
  name: string;
  weight: number;
  createdAt?: string;
  updatedAt?: string;
};

export type StudentGrade = {
  id: number;
  gradeItemId: number;
  studentId: string;
  score: number;
  published: boolean;
  student?: { id: string; name: string; email: string };
};

export type GradeBreakdown = {
  classId: number;
  className: string;
  items: GradeItem[];
  grades: StudentGrade[];
  overallGrade: number | null;
};

export type EnrolledStudent = {
  studentId: string;
  name: string;
  email: string;
};

export async function fetchGradeItems(classId: number) {
  const payload = await apiFetch<{ data: GradeItem[] }>(
    `classes/${classId}/grade-items`,
  );
  return payload.data;
}

export async function createGradeItem(
  classId: number,
  data: { name: string; weight: number },
) {
  const payload = await apiFetch<{ data: GradeItem }>(
    `classes/${classId}/grade-items`,
    { method: "POST", body: JSON.stringify(data) },
  );
  return payload.data;
}

export async function updateGradeItem(
  id: number,
  data: { name?: string; weight?: number },
) {
  const payload = await apiFetch<{ data: GradeItem }>(`grade-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return payload.data;
}

export async function deleteGradeItem(id: number) {
  await apiFetch(`grade-items/${id}`, { method: "DELETE" });
}

export async function fetchClassGrades(classId: number, studentId?: string) {
  const query = studentId
    ? `?studentId=${encodeURIComponent(studentId)}`
    : "";
  const payload = await apiFetch<{ data: GradeBreakdown }>(
    `classes/${classId}/grades${query}`,
  );
  return payload.data;
}

export async function saveClassGrades(
  classId: number,
  grades: Array<{
    gradeItemId: number;
    studentId: string;
    score: number;
    published: boolean;
  }>,
) {
  await apiFetch(`classes/${classId}/grades`, {
    method: "PUT",
    body: JSON.stringify({ grades }),
  });
}

export async function fetchClassEnrollments(classId: number) {
  const payload = await apiFetch<{ data: EnrolledStudent[] }>(
    `classes/${classId}/enrollments`,
  );
  return payload.data;
}
