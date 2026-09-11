const { z } = require("zod");
const { ValidationError } = require("../utils/errors");

const createHealthConcernSchema = z.object({
  concern: z.union([
    z.string().min(2, "Main health concern title is required"),
    z.object({
      title: z.string().min(2, "Main health concern title is required"),
      description: z.string().min(10, "Please describe your concern (at least 10 characters)"),
      category: z.string().optional(),
    }),
  ]),
  description: z.string().optional(),
  category: z.string().optional(),
  onset: z.string().min(1, "Onset timing is required"),
  severity: z.coerce.number().min(1, "Severity rating must be at least 1").max(10, "Severity rating cannot exceed 10"),
  frequency: z.string().optional(),
  location: z.string().optional(),
  triggers: z.string().optional(),
  relievingFactors: z.string().optional(),
  associatedSymptoms: z.array(z.string()).optional(),
  medicalConditions: z.union([z.string(), z.array(z.string())]).optional(),
  medications: z.union([z.string(), z.array(z.string())]).optional(),
  allergies: z.union([z.string(), z.array(z.string())]).optional(),
  previousTreatment: z.string().optional(),
  additionalInformation: z.string().optional(),
});

const validateCreateHealthConcern = (req, res, next) => {
  try {
    const parsed = createHealthConcernSchema.parse(req.body);
    req.validatedBody = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return next(new ValidationError("Invalid health concern data", details));
    }
    next(error);
  }
};

const updateHealthConcernSchema = createHealthConcernSchema.partial();

const validateUpdateHealthConcern = (req, res, next) => {
  try {
    const parsed = updateHealthConcernSchema.parse(req.body);
    req.validatedBody = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return next(new ValidationError("Invalid health concern data for update", details));
    }
    next(error);
  }
};

module.exports = {
  validateCreateHealthConcern,
  validateUpdateHealthConcern,
};
