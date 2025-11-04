import { z } from 'zod'

// Schema para crear/editar producto
export const productFormSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  
  description: z
    .string()
    .max(1000, 'La descripción no puede superar 1000 caracteres')
    .optional()
    .nullable(),
  
  short_description: z
    .string()
    .max(150, 'La descripción corta no puede superar 150 caracteres')
    .optional()
    .nullable(),
  
  price: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(10000000, 'El precio es demasiado alto'),
  
  category_id: z
    .string()
    .uuid('Debe seleccionar una categoría válida'),
  
  type_id: z
    .string()
    .uuid()
    .optional()
    .nullable(),
  
  notes: z
    .string()
    .max(200, 'Las notas no pueden superar 200 caracteres')
    .optional()
    .nullable(),
  
  is_active: z.boolean().default(true),
  
  is_featured: z.boolean().default(false),
})

// Schema para los talles
export const productSizesSchema = z
  .array(z.string().min(1, 'El talle no puede estar vacío'))
  .min(1, 'Debe agregar al menos un talle')

// Schema completo para el formulario
export const fullProductFormSchema = z.object({
  product: productFormSchema,
  sizes: productSizesSchema,
})

// Tipos inferidos
export type ProductFormData = z.infer<typeof productFormSchema>
export type ProductSizesData = z.infer<typeof productSizesSchema>
export type FullProductFormData = z.infer<typeof fullProductFormSchema>