import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.errors.map((e) => ({
        path: e.path,
        message: e.message,
      })),
    });
  }
};

// Schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const createLessonSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    dateTime: z.string().datetime(),
  }),
});

export const updateLessonStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    amount: z.number().positive(),
    lessonCount: z.number().int().positive(),
    comment: z.string().optional(),
  }),
});
