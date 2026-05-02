import type { Subject } from "@/types";

export const DEPARTMENTS =["CS","Math","English"];

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept)=>({
    value:dept,
    label:dept,
}));

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 1,
    code: "CS-301",
    name: "Data Structures and Algorithms",
    department: "CS",
    description:
      "Core CS course covering lists, trees, graphs, hashing, and complexity analysis with practical problem-solving.",
    createdAt: "2026-08-15T12:00:00.000Z",
  },
  {
    id: 2,
    code: "MATH-220",
    name: "Linear Algebra",
    department: "Math",
    description:
      "Vectors, matrices, linear systems, eigenvalues, and orthogonality with applications across science and engineering.",
    createdAt: "2026-08-20T12:00:00.000Z",
  },
  {
    id: 3,
    code: "ENG-201",
    name: "Technical Writing for STEM",
    department: "English",
    description:
      "Clear communication for technical audiences: reports, documentation, and presentations with revision workshops.",
    createdAt: "2026-09-01T12:00:00.000Z",
  },
];