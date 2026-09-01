const { z } = require("zod");

const ALLOWED_ROLES = ["PATIENT", "DOCTOR", "ADMIN"];

const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .max(255, "Email cannot exceed 255 characters"),
  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[+0-9\s\-()]+$/, "Invalid phone number format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password cannot exceed 128 characters"),
  role: z.enum(ALLOWED_ROLES, {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}` };
      }
      return { message: ctx.defaultError };
    },
  }),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required" })
    .min(1, "Refresh token is required"),
});

const verifyEmailSchema = z.object({
  token: z
    .string({ required_error: "Verification token is required" })
    .min(1, "Verification token is required"),
});

const resendVerificationSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: "Reset token is required" })
    .min(1, "Reset token is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(8, "New password must be at least 8 characters long")
    .max(128, "New password cannot exceed 128 characters"),
});

const changePasswordSchema = z.object({
  oldPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, "Current password is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(8, "New password must be at least 8 characters long")
    .max(128, "New password cannot exceed 128 characters"),
});

/**
 * Validate input against a Zod schema
 * @param {z.ZodSchema} schema
 * @param {object} data
 * @returns {object} parsed & sanitized data
 */
const validateInput = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedDetails = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return { success: false, details: formattedDetails };
  }
  return { success: true, data: result.data };
};

module.exports = {
  ALLOWED_ROLES,
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  validateInput,
};
