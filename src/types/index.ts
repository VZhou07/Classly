export type Department = {
    id: number;
    code: string;
    name: string;
    description: string;
};

export type Subject = {
    id: number;
    name: string;
    code: string;
    description: string;
    departmentId: number;
    department?: Department;
    createdAt?: string;
};

export type ListResponse<T = unknown> = {
    data?: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export type CreateResponse<T = unknown> = {
    data?: T;
};

export type GetOneResponse<T = unknown> = {
    data?: T;
};

declare global {
    interface CloudinaryUploadWidgetResults {
        event: string;
        info: {
            secure_url: string;
            public_id: string;
            delete_token?: string;
            resource_type: string;
            original_filename: string;
        };
    }

    interface CloudinaryWidget {
        open: () => void;
    }

    interface Window {
        cloudinary?: {
            createUploadWidget: (
                options: Record<string, unknown>,
                callback: (
                    error: unknown,
                    result: CloudinaryUploadWidgetResults
                ) => void
            ) => CloudinaryWidget;
        };
    }
}

export interface UploadWidgetValue {
    url: string;
    publicId: string;
}

export interface UploadWidgetProps {
    value?: UploadWidgetValue | null;
    onChange?: (value: UploadWidgetValue | null) => void;
    disabled?: boolean;
}

export enum UserRole {
    STUDENT = "student",
    TEACHER = "teacher",
    ADMIN = "admin",
}

export type User = {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string;
    imageCldPubId?: string;
    department?: string;
};

/** Raw schedule from API/forms — times may use start/end or startTime/endTime. */
export type Schedule = {
    day: string;
    start?: string;
    end?: string;
    startTime?: string;
    endTime?: string;
};

/** Normalized schedule for UI (ClassCard, etc.) — start/end always defined. */
export type ClassScheduleSlot = {
    day: string;
    start: string;
    end: string;
};

export function toClassScheduleSlot(schedule: Schedule): ClassScheduleSlot {
    return {
        day: schedule.day,
        start: schedule.start ?? schedule.startTime ?? "",
        end: schedule.end ?? schedule.endTime ?? "",
    };
}

export type ClassDetails = {
    id: number;
    name: string;
    description: string;
    status: "active" | "inactive";
    capacity: number;
    courseCode: string;
    courseName: string;
    bannerUrl?: string;
    bannerCldPubId?: string;
    subject?: Subject;
    teacher?: User;
    department?: Department;
    schedules: Schedule[];
    inviteCode?: string;
};

export type Identity = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: "admin" | "teacher" | "student";
};

export type Invitation = {
    id: number;
    email: string;
    role: "teacher" | "student";
    status: "pending" | "accepted" | "expired" | "revoked";
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    className?: string | null;
    invitedBy?: {
        id: string;
        name: string;
        email: string;
    } | null;
};

export type GradeItem = {
    id: number;
    classId: number;
    name: string;
    weight: number;
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

export type ClassListItem = ClassDetails & {
    enrollmentCount?: number;
    subject?: Subject & { name?: string };
};

export type EnrolledStudent = {
    studentId: string;
    name: string;
    email: string;
};

export type SignUpPayload = {
    email: string;
    name: string;
    password: string;
    image?: string;
    imageCldPubId?: string;
    role: UserRole;
};