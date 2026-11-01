import z, { email } from "zod";

const UserSelfUpdateRequestSchema = z.object({
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
  //proflePicture:
});
