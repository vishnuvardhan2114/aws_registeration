import { z } from "zod";

// Registration form validation schema
export const registrationSchema = z.object({
   fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters")
      .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),

   dateOfBirth: z
      .date({
         error: "Date of birth is required",
      })
      .refine(
         (date) => {
            const today = new Date();
            const minDate = new Date("1900-01-01");
            return date <= today && date >= minDate;
         },
         {
            message: "Please enter a valid date of birth",
         }
      ),

   batch: z.number(),
   email: z
      .string()
      .email("Please enter a valid email address")
      .max(255, "Email must be less than 255 characters")
      .optional(),

   phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be less than 15 digits")
      .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),

   image: z
      .any()
      .refine(
         (file) => {
            if (!file) return false; // Required field
            return file instanceof File;
         },
         {
            message: "Photo is required. Please upload a valid file",
         }
      )
      .refine(
         (file) => {
            if (!file) return false; // Required field
            return file.type.startsWith("image/");
         },
         {
            message: "Please upload a valid image file",
         }
      )
      .refine(
         (file) => {
            if (!file) return false; // Required field
            return file.size <= 5 * 1024 * 1024; // 5MB limit
         },
         {
            message: "Image size must be less than 5MB",
         }
      ),
});

// Type inference from schema
export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Batch years validation
export const batchYears = Array.from(
   { length: new Date().getFullYear() - 1900 + 1 },
   (_, i) => 1900 + i
).reverse();

// Image file validation
export const validateImageFile = (
   file: File
): { isValid: boolean; error?: string } => {
   // Check file type
   if (!file.type.startsWith("image/")) {
      return { isValid: false, error: "Please upload a valid image file" };
   }

   // Check file size (5MB limit)
   if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: "Image size must be less than 5MB" };
   }

   // Check specific image types
   const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
   if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: "Only JPEG and PNG files are allowed" };
   }

   return { isValid: true };
};
