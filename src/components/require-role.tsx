import type { PropsWithChildren } from "react";
import { useGetIdentity, useLink } from "@refinedev/core";
import type { Identity } from "@/types";

type RequireRoleProps = PropsWithChildren<{
  roles: NonNullable<Identity["role"]>[];
}>;

export const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const { data: identity, isLoading } = useGetIdentity<Identity>();
  const Link = useLink();

  if (isLoading) {
    return null;
  }

  if (!identity?.role || !roles.includes(identity.role)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <h1 className="text-xl font-semibold">You don't have access to this page</h1>
        <p className="text-muted-foreground">
          This page is only available to {roles.join(" or ")} accounts.
        </p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 underline">
          Go back home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
