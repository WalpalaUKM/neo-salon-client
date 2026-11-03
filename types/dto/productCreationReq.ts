import z from "zod";

export const productCreationSchema = z.object({
  sku: z.string().max(50),
  name: z.string().max(100),
  altNmae: z.array(z.string()).default([]).optional(),
  description: z.string().max(500),
  stock: z.number().int().nonnegative().default(0),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  brand: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  productStatus: z.enum(["ACTIVE", "INACTIVE", "DELETED"]).default("ACTIVE"),
  media: z.array(
    z.object({
      url: z.url(),
      type: z.enum(["IMAGE", "VIDEO"]),
    }),
  ),
});
