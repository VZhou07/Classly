import React from "react";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { useBack, useList, type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subjectSchema } from "@/lib/schema";
import * as z from "zod";
import { toast } from "sonner";
import {
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
  Field,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireRole } from "@/components/require-role";
import type { Department } from "@/types";

type CreateSubjectFormOutput = z.infer<typeof subjectSchema>;

const Create = () => {
  const back = useBack();
  const {
    refineCore: { onFinish, formLoading },
    ...form
  } = useForm<CreateSubjectFormOutput, HttpError, CreateSubjectFormOutput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      departmentId: undefined,
    },
    refineCoreProps: {
      resource: "subjects",
      action: "create",
      onMutationSuccess: () => {
        toast.success("Subject created successfully");
        back();
      },
      onMutationError: (error) => {
        toast.error(error.message ?? "Failed to create subject");
      },
    },
  });

  const { query: DepartmentsQuery } = useList({
    resource: "departments",
  });
  const departments = (DepartmentsQuery.data?.data ?? []) as Department[];
  const departmentIsLoading = DepartmentsQuery.isLoading;

  function onSubmit(data: CreateSubjectFormOutput) {
    onFinish(data);
  }

  return (
    <CreateView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Create Subject</h1>
      <div className="intro-row flex-col">
        <p>Provide the details of the subject to be created.</p>
      </div>
      <Separator />
      <div className="my-2 flex items-center">
        <Card className="class-form-card">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold">
              Fill in the details to create a new subject
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full max-w-2xl mx-auto px-4 sm:px-6">
            <form
              id="rhf-create-subject-form"
              className="w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FieldGroup className="w-full gap-6">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="rhf-create-subject-form-name">
                        Subject name
                        <span className="text-red-500">
                          {fieldState.error ? "*" : null}
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="rhf-create-subject-form-name"
                        className="h-11 w-full text-base"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter the name of the subject"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 mb-3">
                  <Controller
                    name="code"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="rhf-create-subject-form-code">
                          Code
                          <span className="text-red-500">
                            {fieldState.error ? "*" : null}
                          </span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="rhf-create-subject-form-code"
                          className="h-11 w-full text-base"
                          aria-invalid={fieldState.invalid}
                          placeholder="e.g. MATH101"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="departmentId"
                    control={form.control}
                    disabled={departmentIsLoading}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="min-w-0"
                      >
                        <FieldLabel htmlFor="rhf-create-subject-form-department">
                          Department
                          <span className="text-red-500">
                            {fieldState.error ? "*" : null}
                          </span>
                        </FieldLabel>
                        <Select
                          name={field.name}
                          disabled={field.disabled}
                          value={
                            field.value === undefined || field.value === null
                              ? undefined
                              : String(field.value)
                          }
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          onOpenChange={(open) => {
                            if (!open) field.onBlur();
                          }}
                        >
                          <SelectTrigger
                            id="rhf-create-subject-form-department"
                            ref={field.ref}
                            className="mb-1 h-11 w-full min-w-0 max-w-none justify-between text-base"
                          >
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72 min-w-[var(--radix-select-trigger-width)]">
                            {departments.map((department) => (
                              <SelectItem
                                key={department.id}
                                value={String(department.id)}
                              >
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="rhf-create-subject-form-description">
                        Description
                        <span className="text-red-500">
                          {fieldState.error ? "*" : null}
                        </span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="rhf-create-subject-form-description"
                          placeholder="Describe what this subject covers."
                          rows={6}
                          maxLength={255}
                          className="min-h-32 w-full resize-none text-base"
                          aria-invalid={fieldState.invalid}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {field.value.length}/255 characters
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription>
                        Include topics, level, and how this subject is used in
                        the curriculum.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
            <Button
              className="mr-4"
              type="submit"
              form="rhf-create-subject-form"
              disabled={formLoading}
            >
              {formLoading ? "Creating..." : "Submit"}
            </Button>
            <Button onClick={back}>Back</Button>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

const SubjectsCreatePage = () => (
  <RequireRole roles={["admin"]}>
    <Create />
  </RequireRole>
);

export default SubjectsCreatePage;
