import type { Identity } from "@/types";

export type AppRole = NonNullable<Identity["role"]>;

export function canSeeNavItem(resource: string, role?: AppRole): boolean {
  switch (resource) {
    case "invites":
      return role === "admin" || role === "teacher";
    case "join-class":
      return role === "student";
    default:
      return true;
  }
}

export function canCreateResource(resource: string, role?: AppRole): boolean {
  if (resource === "classes" || resource === "subjects") {
    return role === "admin";
  }
  return true;
}
