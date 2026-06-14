import React from "react";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { useBack, type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Controller, type ControllerRenderProps } from "react-hook-form";
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
import UploadWidget from "@/components/UploadWidget";
import type { UploadWidgetValue } from "@/types";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { User } from "@/types";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useState } from "react";
import { useEffect } from "react";
import { useList } from "@refinedev/core";
import type { Subject } from "@/types";


const createClassStepSchema = classSchema.pick({
  name: true,
  description: true,
  subjectId: true,
  teacherId: true,
  capacity: true,
  status: true,
  bannerUrl: true,
  bannerCldPubId: true,
});


type CreateClassFormInput = z.input<typeof createClassStepSchema>;
type CreateClassFormOutput = z.infer<typeof createClassStepSchema>;



const Create = () => {
  const back = useBack();
  const { refineCore: { onFinish, formLoading }, ...form } = useForm<
    CreateClassFormOutput,
    HttpError,
    CreateClassFormOutput
  >({
    resolver: zodResolver(createClassStepSchema),
    defaultValues: {
      name: "",
      description: "",
      subjectId: undefined,
      teacherId: "",
      capacity: undefined,
      status: undefined,
      bannerUrl: "",
      bannerCldPubId: "",
    },
    refineCoreProps:{
      resource:"classes",
      action:"create",
      onMutationSuccess:()=>{
        toast.success("Class created successfully");
        back();
      },
      onMutationError:(error)=>{
        toast.error(error.message ?? "Failed to create class");
      },
    },
    
  });
  const bannerPublicId=form.watch("bannerCldPubId");
  const setBannerImage = (
    next: UploadWidgetValue | null,
    field: ControllerRenderProps<CreateClassFormInput, "bannerUrl">
  ) => {
    if (next) {
      field.onChange(next.url);
      form.setValue("bannerCldPubId", next.publicId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      field.onChange("");
      form.setValue("bannerCldPubId", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

const {query:TeachersQuery}=useList({
  resource:"users",
  filters:[{
    field:"role",
    operator:"eq",
    value:"teacher",
  }],
});
const teachers = (TeachersQuery.data?.data ?? []) as User[];
const teacherIsLoading=TeachersQuery.isLoading;

const {query:SubjectsQuery}=useList({
  resource:"subjects",
});
const subjects = (SubjectsQuery.data?.data ?? []) as Subject[];
const subjectIsLoading=SubjectsQuery.isLoading;

  function onSubmit(data: CreateClassFormOutput) {
    onFinish(data);
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
              <Controller
                name="bannerUrl"
                control={form.control}
                render={({ field, fieldState,formState }) => (
                    <Field
                      data-invalid={
                        fieldState.invalid
                      }
                      className="mb-6"
                    >
                      <FieldLabel htmlFor="rhf-create-class-form-banner">
                        Banner Image
                        <span className="text-red-500">{fieldState.error?("*"):(null)}</span>
                      </FieldLabel>
                      <UploadWidget
                        value={
                          field.value && bannerPublicId
                            ? {
                                url: field.value,
                                publicId: bannerPublicId,
                              }
                            : null
                        }
                        onChange={(next: UploadWidgetValue | null) =>
                          setBannerImage(next, field)
                        }
                      />
                      {fieldState.invalid && (
                          <FieldError errors={[fieldState.error,formState.errors.bannerCldPubId]} />
                        )}
                    </Field>)}/>
              <FieldGroup className="w-full gap-6">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="rhf-create-class-form-title">
                        Class name
                        <span className="text-red-500">{fieldState.error?("*"):(null)}</span>
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
                        <span className="text-red-500">{fieldState.error?("*"):(null)}</span>
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
                          <span className="text-red-500">{fieldState.error?("*"):(null)}</span>

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
                          <span className="text-red-500">{fieldState.error?("*"):(null)}</span>

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
                    disabled={subjectIsLoading}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="min-w-0"
                      >
                        <FieldLabel htmlFor="rhf-create-class-form-subject">
                          Subject
                          <span className="text-red-500">{fieldState.error?("*"):(null)}</span>

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
                            id="rhf-create-class-form-subject"
                            ref={field.ref}
                            className="mb-1 h-11 w-full min-w-0 max-w-none justify-between text-base"
                          >
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72 min-w-[var(--radix-select-trigger-width)]">
                            {subjects.map((subject:Subject)=>{
                              return(
                              <SelectItem
                                key={subject.id}
                                value={String(subject.id)}
                              >
                                {subject.name}
                              </SelectItem>
                            )})}
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
                    disabled={teacherIsLoading}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="min-w-0"
                      >
                        <FieldLabel htmlFor="rhf-create-class-form-teacher">
                          Teacher
                          <span className="text-red-500">{fieldState.error?("*"):(null)}</span>

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
                          
                            {teachers.map((teacher:User)=>(
                              <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
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
            <Button
              className="mr-4"
              type="submit"
              form="rhf-create-class-form"
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

export default Create;
