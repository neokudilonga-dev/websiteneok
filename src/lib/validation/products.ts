import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["book", "game"]),
  name: z.union([
    z.string().min(1, "Name is required"),
    z.object({
      pt: z.string().optional(),
      en: z.string().optional(),
    }).refine(data => {
      const ptValid = data.pt && data.pt.trim().length >= 1;
      const enValid = data.en && data.en.trim().length >= 1;
      return ptValid || enValid;
    }, {
      message: "Name must be provided in at least one language",
      path: ["pt"]
    }),
  ]),
  description: z.union([
    z.string(),
    z.object({
      pt: z.string().optional(),
      en: z.string().optional(),
    }),
  ]).optional(),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock must be positive"),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'sold_out']),
  category: z.string().min(1, "Category is required"),
  publisher: z.string().optional(),
  author: z.string().optional(),
  storagePlace: z.string().length(3).regex(/^[A-Za-z]\d{2}$/, 'Must be Letter + 2 numbers').optional().or(z.literal('')),
  image: z.union([z.string(), z.array(z.string())]).optional(),
  readingPlan: z.array(z.any()).optional(),
});

export const productCreateSchema = productSchema.extend({
  image: z.union([
    z.string().min(1, "Image is required"),
    z.array(z.string()).min(1, "At least one image is required").max(3, "Maximum 3 images allowed"),
  ]),
});
