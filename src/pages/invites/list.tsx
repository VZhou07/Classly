import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { RequireRole } from "@/components/require-role";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Invitation } from "@/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
] as const;

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const statusVariant = (
  status: Invitation["status"],
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "accepted":
      return "default";
    case "pending":
      return "secondary";
    case "expired":
    case "revoked":
      return "destructive";
    default:
      return "outline";
  }
};

const InvitesListContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const searchFilters = searchQuery
    ? [{ field: "email", operator: "contains" as const, value: searchQuery }]
    : [];

  const statusFilters =
    selectedStatus === "all"
      ? []
      : [{ field: "status", operator: "eq" as const, value: selectedStatus }];

  const inviteTable = useTable<Invitation>({
    columns: useMemo<ColumnDef<Invitation>[]>(
      () => [
        {
          id: "email",
          accessorKey: "email",
          size: 220,
          header: () => <p className="column-title">Email</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "role",
          accessorKey: "role",
          size: 100,
          header: () => <p className="column-title">Role</p>,
          cell: ({ getValue }) => (
            <Badge variant="outline">{getValue<string>()}</Badge>
          ),
        },
        {
          id: "status",
          accessorKey: "status",
          size: 110,
          header: () => <p className="column-title">Status</p>,
          cell: ({ getValue }) => (
            <Badge variant={statusVariant(getValue<Invitation["status"]>())}>
              {getValue<string>()}
            </Badge>
          ),
        },
        {
          id: "className",
          accessorKey: "className",
          size: 160,
          header: () => <p className="column-title">Class</p>,
          cell: ({ getValue }) => {
            const className = getValue<string | null>();
            return className ? (
              <Badge variant="secondary">{className}</Badge>
            ) : (
              <span className="text-muted-foreground">—</span>
            );
          },
        },
        {
          id: "invitedBy",
          accessorKey: "invitedBy.name",
          size: 160,
          header: () => <p className="column-title">Invited by</p>,
          cell: ({ row }) => (
            <span className="text-foreground">
              {row.original.invitedBy?.name ?? "—"}
            </span>
          ),
        },
        {
          id: "expiresAt",
          accessorKey: "expiresAt",
          size: 180,
          header: () => <p className="column-title">Expires</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground text-sm">
              {formatDate(getValue<string>())}
            </span>
          ),
        },
        {
          id: "createdAt",
          accessorKey: "createdAt",
          size: 180,
          header: () => <p className="column-title">Sent</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground text-sm">
              {formatDate(getValue<string>())}
            </span>
          ),
        },
      ],
      [],
    ),
    refineCoreProps: {
      resource: "invites",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: [...searchFilters, ...statusFilters] },
      sorters: {
        initial: [{ field: "createdAt", order: "desc" }],
      },
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Invites</h1>
      <div className="intro-row">
        <p>View and manage invitations you have sent.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by email..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateButton resource="invites" />
          </div>
        </div>
      </div>
      <DataTable table={inviteTable} />
    </ListView>
  );
};

const InvitesList = () => {
  return (
    <RequireRole roles={["admin", "teacher"]}>
      <InvitesListContent />
    </RequireRole>
  );
};

export default InvitesList;
