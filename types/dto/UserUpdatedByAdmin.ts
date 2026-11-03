import z, { email, never } from "zod";
import { id } from "zod/locales";

const UserUpdatedByAdminSchema = z.object({
  id: never().optional(),
  password: z.never().optional(),
});

export type UserUpdatedByAdmin = z.infer<typeof UserUpdatedByAdminSchema>;

export { UserUpdatedByAdminSchema };
