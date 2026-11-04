import z from "zod";

export const MediaArraySchema = z.array(
  z.object({
    url: z.url(),
    type: z.enum(["IMAGE", "VIDEO"]),
  }),
);

const productUpdateSchema = z.object({
  sku: z.string().max(50).optional(),
  name: z.string().max(100).optional(),
  altName: z.array(z.string()).default([]).optional(),
  description: z.string().max(500).optional(),
  stock: z.number().int().nonnegative().default(0).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  brand: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  productStatus: z
    .enum(["ACTIVE", "INACTIVE", "DELETED"])
    .default("ACTIVE")
    .optional(),
  media: MediaArraySchema.optional(),
});

export { productUpdateSchema };
export type ProductUpdateReq = z.infer<typeof productUpdateSchema>;
