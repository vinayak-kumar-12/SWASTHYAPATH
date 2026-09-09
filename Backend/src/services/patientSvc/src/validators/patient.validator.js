const { z } = require("zod");

const genderEnum = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);

const createPatientSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters").max(100, "First name cannot exceed 100 characters"),
  last_name: z.string().max(100).optional().nullable(),
  date_of_birth: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date of birth format")
    .refine((val) => !val || new Date(val) <= new Date(), "Date of birth cannot be in the future")
    .optional()
    .nullable(),
  gender: genderEnum.optional().nullable(),
  phone: z
    .string()
    .regex(/^[+0-9\s\-()]{10,20}$/, "Invalid phone number format")
    .optional()
    .nullable(),
  email: z.string().email("Invalid email address format").optional().nullable(),
  preferred_language: z.string().max(50).optional().nullable(),
  address_line1: z.string().max(255).optional().nullable(),
  address_line2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  emergency_contact_name: z.string().max(150).optional().nullable(),
  emergency_contact_phone: z
    .string()
    .regex(/^[+0-9\s\-()]{10,20}$/, "Invalid emergency contact phone number format")
    .optional()
    .nullable(),
  profile_image_url: z.string().url("Invalid profile image URL").optional().nullable(),
});

const updatePatientSchema = createPatientSchema.partial();

module.exports = {
  createPatientSchema,
  updatePatientSchema,
};
