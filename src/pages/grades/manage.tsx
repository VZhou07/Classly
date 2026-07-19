import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useGetIdentity, useLink, useShow } from "@refinedev/core";
import { RequireRole } from "@/components/require-role";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createGradeItem,
  deleteGradeItem,
  fetchClassEnrollments,
  fetchClassGrades,
  fetchGradeItems,
  saveClassGrades,
} from "@/lib/api";
import type { EnrolledStudent, GradeItem, Identity, StudentGrade } from "@/types";
import { useNotification } from "@refinedev/core";

type GradeDraft = {
  score: string;
  published: boolean;
};

function GradebookContent() {
  const { id } = useParams();
  const classId = Number(id);
  const Link = useLink();
  const { data: identity } = useGetIdentity<Identity>();
  const { open } = useNotification();

  const { query: classQuery } = useShow({
    resource: "classes",
    id: id,
  });
  const classData = classQuery.data?.data;

  const [items, setItems] = useState<GradeItem[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [drafts, setDrafts] = useState<Record<string, GradeDraft>>({});
  const [newItemName, setNewItemName] = useState("");
  const [newItemWeight, setNewItemWeight] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isOwner =
    identity?.role === "teacher" &&
    (classData?.teacherId === identity.id ||
      classData?.teacher?.id === identity.id);

  const loadData = useCallback(async () => {
    if (isNaN(classId)) return;
    setLoading(true);
    try {
      const [gradeItems, enrollments, gradeData] = await Promise.all([
        fetchGradeItems(classId),
        fetchClassEnrollments(classId),
        fetchClassGrades(classId),
      ]);
      setItems(gradeItems);
      setStudents(enrollments);
      setGrades(gradeData.grades);
      setSelectedItemId((prev) => prev ?? gradeItems[0]?.id ?? null);
    } catch (e) {
      open?.({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to load gradebook",
      });
    } finally {
      setLoading(false);
    }
  }, [classId, open]);

  useEffect(() => {
    if (classQuery.isLoading || !identity) return;
    if (!isOwner) {
      setLoading(false);
      return;
    }
    loadData();
  }, [isOwner, loadData, classQuery.isLoading, identity]);

  const totalWeight = useMemo(
    () => items.reduce((sum, i) => sum + i.weight, 0),
    [items],
  );

  const draftKey = (itemId: number, studentId: string) =>
    `${itemId}-${studentId}`;

  const getDraft = (itemId: number, studentId: string): GradeDraft => {
    const key = draftKey(itemId, studentId);
    if (drafts[key]) return drafts[key];
    const existing = grades.find(
      (g) => g.gradeItemId === itemId && g.studentId === studentId,
    );
    return {
      score: existing ? String(existing.score) : "",
      published: existing?.published ?? false,
    };
  };

  const setDraft = (
    itemId: number,
    studentId: string,
    patch: Partial<GradeDraft>,
  ) => {
    const key = draftKey(itemId, studentId);
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...getDraft(itemId, studentId), ...patch },
    }));
  };

  const handleAddItem = async () => {
    const weight = Number(newItemWeight);
    if (!newItemName.trim() || isNaN(weight)) {
      open?.({ type: "error", message: "Enter a name and valid weight" });
      return;
    }
    try {
      const item = await createGradeItem(classId, {
        name: newItemName.trim(),
        weight,
      });
      setItems((prev) => [...prev, item]);
      setSelectedItemId(item.id);
      setNewItemName("");
      setNewItemWeight("");
      open?.({ type: "success", message: "Assignment added" });
    } catch (e) {
      open?.({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to add assignment",
      });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteGradeItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      if (selectedItemId === itemId) {
        setSelectedItemId(items.find((i) => i.id !== itemId)?.id ?? null);
      }
      open?.({ type: "success", message: "Assignment removed" });
    } catch (e) {
      open?.({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to delete assignment",
      });
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedItemId) return;
    setSaving(true);
    try {
      const updates = students.map((student) => {
        const draft = getDraft(selectedItemId, student.studentId);
        return {
          gradeItemId: selectedItemId,
          studentId: student.studentId,
          score: Number(draft.score) || 0,
          published: draft.published,
        };
      });
      await saveClassGrades(classId, updates);
      setDrafts({});
      await loadData();
      open?.({ type: "success", message: "Grades saved" });
    } catch (e) {
      open?.({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to save grades",
      });
    } finally {
      setSaving(false);
    }
  };

  if (classQuery.isLoading || loading) {
    return (
      <ListView>
        <p className="text-muted-foreground py-12 text-center">Loading...</p>
      </ListView>
    );
  }

  if (!isOwner) {
    return (
      <ListView>
        <p className="text-destructive py-12 text-center">
          You can only manage grades for your own classes.
        </p>
      </ListView>
    );
  }

  return (
    <ListView>
      <Breadcrumb />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">
            Gradebook — {classData?.name ?? "Class"}
          </h1>
          <p className="text-muted-foreground">
            Define assignments and publish grades per student.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/classes/show/${classId}`}>Back to class</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="item-name">Name</Label>
                <Input
                  id="item-name"
                  placeholder="Assignment 1"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>
              <div className="w-24">
                <Label htmlFor="item-weight">Weight %</Label>
                <Input
                  id="item-weight"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="30"
                  value={newItemWeight}
                  onChange={(e) => setNewItemWeight(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddItem}>Add assignment</Button>
            <p className="text-sm text-muted-foreground">
              Total weight: {totalWeight}%
              {totalWeight !== 100 && totalWeight > 0 && (
                <span className="text-amber-600 dark:text-amber-400 ml-1">
                  (does not sum to 100%)
                </span>
              )}
            </p>
            {items.length > 0 && (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <button
                      type="button"
                      className={`text-left flex-1 ${selectedItemId === item.id ? "font-semibold" : ""}`}
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      {item.name}{" "}
                      <span className="text-muted-foreground">
                        ({item.weight}%)
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade students</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedItemId ? (
              <p className="text-muted-foreground">
                Add an assignment to start grading.
              </p>
            ) : students.length === 0 ? (
              <p className="text-muted-foreground">
                No students enrolled in this class yet.
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="w-28">Score %</TableHead>
                      <TableHead className="w-24">Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const draft = getDraft(
                        selectedItemId,
                        student.studentId,
                      );
                      return (
                        <TableRow key={student.studentId}>
                          <TableCell>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.email}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={draft.score}
                              onChange={(e) =>
                                setDraft(selectedItemId, student.studentId, {
                                  score: e.target.value,
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={draft.published}
                              onCheckedChange={(checked) =>
                                setDraft(selectedItemId, student.studentId, {
                                  published: checked,
                                })
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <Button
                  className="mt-4"
                  onClick={handleSaveGrades}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save grades"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ListView>
  );
}

export default function GradesManage() {
  return (
    <RequireRole roles={["teacher"]}>
      <GradebookContent />
    </RequireRole>
  );
}
