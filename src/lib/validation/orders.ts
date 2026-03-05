import { z } from "zod";

export const orderSchema = z.object({
  reference: z.string().min(1, "Order reference is required"),
  guardianName: z.string().min(1, "Guardian name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(9, "Phone number must be at least 9 digits"),
  studentName: z.string().optional(),
  studentClass: z.string().optional(),
  schoolName: z.string().min(1, "School name is required"),
  schoolId: z.string().min(1, "School ID is required"),
  items: z.array(z.object({
    id: z.string(),
    name: z.union([z.string(), z.record(z.string())]),
    price: z.number().min(0),
    quantity: z.number().min(1),
    type: z.string()
  })).min(1, "At least one item is required"),
  total: z.number().min(0, "Total must be positive"),
  paymentMethod: z.enum(["transferencia", "numerario", "multicaixa"]),
  deliveryOption: z.enum(["delivery", "pickup", "levantamento", "levantamento-local"]),
  deliveryAddress: z.string().optional(),
  preferredDeliveryTime: z.string().optional(),
  language: z.enum(["pt", "en"]).default("pt"),
  paymentStatus: z.enum(["paid", "unpaid", "partially_paid"]).default("unpaid"),
  deliveryStatus: z.enum(["delivered", "not_delivered", "school_pickup"]).default("not_delivered"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const orderUpdateSchema = z.object({
  paymentStatus: z.enum(["paid", "unpaid", "partially_paid"]).optional(),
  deliveryStatus: z.enum(["delivered", "not_delivered", "school_pickup"]).optional(),
  deliveryDate: z.string().optional(),
  guardianName: z.string().optional(),
  phone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  studentName: z.string().optional(),
  studentClass: z.string().optional(),
  items: z.array(z.any()).optional(),
  total: z.number().min(0).optional(),
  deliveryOption: z.string().optional(),
  paymentMethod: z.string().optional(),
  schoolId: z.string().optional(),
  schoolName: z.string().optional(),
  preferredDeliveryTime: z.string().optional()
});
