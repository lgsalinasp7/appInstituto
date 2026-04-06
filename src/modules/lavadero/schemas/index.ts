/**
 * Schemas Zod para Lavadero Pro
 */
import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().min(7, "Teléfono inválido").max(15),
  email: z.email("Email inválido").optional().or(z.literal("")),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createVehicleSchema = z.object({
  plate: z.string().min(4, "Placa inválida").max(10).transform(v => v.toUpperCase()),
  type: z.enum(["CAR", "SUV", "MOTORCYCLE"]),
  color: z.string().optional(),
  brand: z.string().optional(),
  customerId: z.string().min(1, "Cliente requerido"),
});

export const updateVehicleSchema = createVehicleSchema.partial().omit({ customerId: true });

export const createServiceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().positive("El precio debe ser mayor a 0"),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  active: z.boolean().optional(),
});

export const createOrderSchema = z.object({
  vehicleId: z.string().min(1, "Vehículo requerido"),
  customerId: z.string().min(1, "Cliente requerido"),
  serviceIds: z.array(z.string().min(1)).min(1, "Seleccione al menos un servicio"),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["RECEIVED", "WASHING", "READY", "DELIVERED"]),
});

export const createPaymentSchema = z.object({
  orderId: z.string().min(1, "Orden requerida"),
  method: z.enum(["CASH", "NEQUI", "CARD"]),
  amount: z.number().positive("El monto debe ser mayor a 0"),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
