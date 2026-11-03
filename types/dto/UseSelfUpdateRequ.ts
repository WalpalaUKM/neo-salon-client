import z, { email, never, string } from "zod";
import { id } from "zod/locales";

const UserSelfUpdateRequestSchema = z.object({
  id: never().optional(),
  email: email().optional(),
  firstName: z.string().max(20).optional(),
  lastName: z.string().max(20).optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, {
      message: "Phone number must contain exactly 10 digits",
    })
    .optional(),
  password: z.never().optional(),
  profilePicture: string().url().optional(),
});

export type UserSelfUpdateRequest = z.infer<typeof UserSelfUpdateRequestSchema>;

export { UserSelfUpdateRequestSchema };
