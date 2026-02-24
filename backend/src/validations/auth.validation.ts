import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const nameRegex = /^[a-zA-Z\s]+$/;

export const signupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .regex(nameRegex, "Name must contain only alphabets and spaces"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      ),
    role: z.enum(["author", "reader"], {
      message: "Role must be either author or reader",
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});
