import React from "react";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { useBack } from "@refinedev/core";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classSchema } from "@/lib/schema";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const createClassStepSchema = classSchema.pick({
  name: true,
  description: true,
  subjectId: true,
  teacherId: true,
  capacity:true,
  status:true,
});

type CreateClassFormValues = z.infer<typeof createClassStepSchema>;

/** Replace with API / useList when subjects are loaded from the backend */
const SUBJECT_OPTIONS: { id: number; name: string }[] = [
  { id: 1, name: "Subject 1" },
  { id: 2, name: "Subject 2" },
];

const TEACHER_OPTIONS: { id: string; name: string }[] = [
  { id: "teacher-1", name: "Teacher 1" },
  { id: "teacher-2", name: "Teacher 2" },
];

const Create = () => {
  const back = useBack();
  const form = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassStepSchema),
    defaultValues: {
      name: "",
      description: "",
      subjectId: "",
      teacherId: "",
      capacity: "",
      status: "",
    },
  });

  function onSubmit(data: CreateClassFormValues) {
    console.log(data);
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
  }

  return (
    <CreateView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Create Class</h1>
      <div className="intro-row flex-col">
        <p>Provide the details of the class to be created.</p>
      </div>
      <Separator />
      <div className="my-2 flex items-center">
        <Card className="class-form-card">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold">
              Fill in the details to create a new class 
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full max-w-2xl mx-auto px-4 sm:px-6">
            <form
              id="rhf-create-class-form"
              className="w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FieldGroup className="w-full gap-6">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="rhf-create-class-form-title">
                        Class name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="form-rhf-demo-title"
                        className="h-11 w-full text-base"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter the name of the class"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="rhf-create-class-form-description">
                        Description
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="rhf-create-class-form-description"
                          placeholder="Describe what this class covers."
                          rows={6}
                          className="min-h-32 w-full resize-none text-base"
                          aria-invalid={fieldState.invalid}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {field.value.length}/100 characters
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription>
                        Include goals, prerequisites, and how students will use
                        this class.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 mb-3">
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="min-w-0"
                      >
                        <FieldLabel htmlFor="rhf-create-class-form-status">
                          Status
                        </FieldLabel>
                        <Select
                          {...field}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger
                            id="rhf-create-class-form-status"
                            className="mb-1 h-11 w-full min-w-0 max-w-none justify-between text-base"
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72 min-w-[var(--radix-select-trigger-width)]">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />


                  <Controller
                    name="capacity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-rhf-create-class-form-capacity">
                          Capacity
                        </FieldLabel>
                        <Input
                          {...field}
                          id="form-rhf-create-class-form-capacity"
                          aria-invalid={fieldState.invalid}
                          placeholder="0"
                          autoComplete="off"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 mb-3">
                  <FieldGroup>
                  <Controller
                    name="subjectId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="min-w-0"
                      >
                        <FieldLabel htmlFor="rhf-create-class-form-subject">
                          Subject
                        </FieldLabel>
                        <Select
                          {...field}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger
                            id="rhf-create-class-form-subject"
                            ref={field.ref}
                            className="mb-1 h-11 w-full min-w-0 max-w-none justify-between text-base"
                          >
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72 min-w-[var(--radix-select-trigger-width)]">
                            {SUBJECT_OPTIONS.map((subject) => (
                              <SelectItem
                                key={subject.id}
                                value={String(subject.id)}
                              >
                                {subject.name}
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
                  </FieldGroup>
                  <Controller
                  
                    name="teacherId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="min-w-0"
                      >
                        <FieldLabel htmlFor="rhf-create-class-form-teacher">
                          Teacher
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value ? field.value : undefined}
                          onValueChange={field.onChange}
                          onOpenChange={(open) => {
                            if (!open) field.onBlur();
                          }}
                          disabled={field.disabled}
                        >
                          <SelectTrigger
                            id="rhf-create-class-form-teacher"
                            ref={field.ref}
                            className="mb-1 h-11 w-full min-w-0 max-w-none justify-between text-base"
                          >
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72 min-w-[var(--radix-select-trigger-width)]">
                            {TEACHER_OPTIONS.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
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
              </FieldGroup>
            </form>
            <Button className="mr-4"type="submit" form="rhf-create-class-form">
            Submit
            </Button>
            <Button onClick={back}>Back</Button>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

export default Create;
