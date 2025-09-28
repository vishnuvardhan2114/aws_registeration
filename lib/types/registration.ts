// Base form data type from Zod schema
export type RegistrationFormData = {
  fullName: string;
  dateOfBirth: Date;
  batch: number;
  email?: string;
  phoneNumber: string;
  image: File;
};

// Submission data type with calculated age and formatted date
export type RegistrationSubmissionData = Omit<
  RegistrationFormData,
  "dateOfBirth"
> & {
  dateOfBirth: string; // ISO string format (YYYY-MM-DD)
  age: number;
};

// Initial values type for auto-filling form
export type RegistrationFormInitialValues = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO string format (YYYY-MM-DD)
  batch?: number;
};

// Component props interface
export interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
  initialValues?: RegistrationFormInitialValues;
}

// Batch year type
export type BatchYear = number;

// Image upload state type
export interface ImageUploadState {
  preview: string | null;
  file: File | null;
  error: string | null;
}

// Form state type
export interface FormState {
  isSubmitting: boolean;
  imageUpload: ImageUploadState;
}
