/**
 * Zod Schemas for Database Validation
 *
 * This file re-exports Zod schemas generated from the Prisma schema,
 * providing type-safe validation for database operations.
 *
 * Generated from: packages/db/prisma/schema.prisma
 */

// Re-export all generated schemas from the database package
export * from '@packages/db';

// Common validation schemas for API endpoints
import { z } from 'zod';

// User-related schemas
export const userCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['GUEST', 'MEMBER']).default('MEMBER'),
  image: z.string().url('Invalid image URL').optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  image: z.string().url('Invalid image URL').optional(),
  role: z.enum(['GUEST', 'MEMBER']).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Session-related schemas
export const sessionCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  expiresAt: z.date(),
  token: z.string().min(1, 'Token is required'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// Account-related schemas
export const accountCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  providerId: z.string().min(1, 'Provider ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  accessTokenExpiresAt: z.date().optional(),
  refreshTokenExpiresAt: z.date().optional(),
  scope: z.string().optional(),
  password: z.string().optional(),
});

// Profile-related schemas
export const profileCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['GUEST', 'MEMBER']).default('MEMBER'),
  active: z.boolean().default(true),
  version: z.string().optional(),
  photoUrl: z.string().url('Invalid photo URL').optional(),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    country: z.string().min(1, 'Country is required'),
    zip: z.string().min(1, 'ZIP code is required'),
  }).optional(),
});

// Image Process schemas
export const imageProcessCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  imageUrl: z.string().url('Invalid image URL'),
  processedAt: z.date(),
});

// Top Result schemas
export const topResultCreateSchema = z.object({
  imageProcessId: z.string().min(1, 'Image process ID is required'),
  resultData: z.string().min(1, 'Result data is required'),
  createdAt: z.date(),
});

// Product Category schemas
export const productCategoryCreateSchema = z.object({
  metadataId: z.string().min(1, 'Metadata ID is required'),
  categoryType: z.enum(['primitive', 'non-primitive']),
  name: z.string().min(1, 'Category name is required'),
  createdAt: z.date(),
});

// API Integration schemas
export const apiIntegrationCreateSchema = z.object({
  type: z.string().min(1, 'API type is required'),
  details: z.string().min(1, 'API details are required'),
  primitiveCategoryId: z.string().optional(),
  nonPrimitiveCategoryId: z.string().optional(),
});

// Pipeline schemas
export const foodPipelineCreateSchema = z.object({
  productCategoryId: z.string().min(1, 'Product category ID is required'),
  apiIntegrationId: z.string().optional(),
});

export const clothesPipelineCreateSchema = z.object({
  productCategoryId: z.string().min(1, 'Product category ID is required'),
  apiIntegrationId: z.string().optional(),
});

export const drugsPipelineCreateSchema = z.object({
  productCategoryId: z.string().min(1, 'Product category ID is required'),
  apiIntegrationId: z.string().optional(),
});

export const technologyPipelineCreateSchema = z.object({
  productCategoryId: z.string().min(1, 'Product category ID is required'),
  apiIntegrationId: z.string().optional(),
});

// Search Result schemas
export const searchResultCreateSchema = z.object({
  pipelineId: z.string().min(1, 'Pipeline ID is required'),
  expandedData: z.string().min(1, 'Expanded data is required'),
  createdAt: z.date(),
});

// User Choice schemas
export const userChoiceCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  topResultId: z.string().min(1, 'Top result ID is required'),
  selectedAt: z.date(),
});

// User Top Result schemas
export const userTopResultCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  topResultId: z.string().min(1, 'Top result ID is required'),
  selectedAt: z.date(),
});

// Verification schemas
export const verificationCreateSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  value: z.string().min(1, 'Value is required'),
  expiresAt: z.date(),
});

// Common query schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1, { message: 'Search query is required' }),
  category: z.string().optional(),
  filters: z.record(z.any(), z.any()).optional(),
});

// Response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Type exports for TypeScript
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type SessionCreateInput = z.infer<typeof sessionCreateSchema>;
export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type ProfileCreateInput = z.infer<typeof profileCreateSchema>;
export type ImageProcessCreateInput = z.infer<typeof imageProcessCreateSchema>;
export type TopResultCreateInput = z.infer<typeof topResultCreateSchema>;
export type ProductCategoryCreateInput = z.infer<typeof productCategoryCreateSchema>;
export type ApiIntegrationCreateInput = z.infer<typeof apiIntegrationCreateSchema>;
export type FoodPipelineCreateInput = z.infer<typeof foodPipelineCreateSchema>;
export type ClothesPipelineCreateInput = z.infer<typeof clothesPipelineCreateSchema>;
export type DrugsPipelineCreateInput = z.infer<typeof drugsPipelineCreateSchema>;
export type TechnologyPipelineCreateInput = z.infer<typeof technologyPipelineCreateSchema>;
export type SearchResultCreateInput = z.infer<typeof searchResultCreateSchema>;
export type UserChoiceCreateInput = z.infer<typeof userChoiceCreateSchema>;
export type UserTopResultCreateInput = z.infer<typeof userTopResultCreateSchema>;
export type VerificationCreateInput = z.infer<typeof verificationCreateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;
