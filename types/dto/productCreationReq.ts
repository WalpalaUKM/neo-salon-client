import z from "zod";

const productCreationSchema = z.object({
  sku: z.string().max(50),
  name: z.string().max(100),
  altName: z.array(z.string()).default([]).optional(),
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

export default productCreationSchema;
export type ProductCreationReq = z.infer<typeof productCreationSchema>;
