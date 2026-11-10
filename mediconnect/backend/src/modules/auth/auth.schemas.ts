import { z } from 'zod';
import { Role } from '../../middleware/authenticate';

export const ProviderTypeEnum = z.enum([
  'DOCTOR',
  'NURSE',
  'LABORATORY',
  'PHARMACY',
  'AMBULANCE',
  'PHYSIOTHERAPIST',
  'HOME_CARE',
  'OTHER',
]);
export type ProviderType = z.infer<typeof ProviderTypeEnum>;

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number')
    .optional(),
  role: z.enum(['PATIENT', 'PROVIDER'] as [Role, ...Role[]]).default('PATIENT'),
  providerType: ProviderTypeEnum.optional().default('DOCTOR'),
  businessName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
