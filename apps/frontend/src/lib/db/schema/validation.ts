/**
 * Database Validation Utilities
 *
 * This file provides utility functions for validating data using Zod schemas
 * and converting between different database formats.
 */

import { z } from 'zod';
import {
  accountCreateSchema,
  apiIntegrationCreateSchema,
  apiResponseSchema,
  clothesPipelineCreateSchema,
  drugsPipelineCreateSchema,
  foodPipelineCreateSchema,
  imageProcessCreateSchema,
  paginatedResponseSchema,
  paginationSchema,
  productCategoryCreateSchema,
  profileCreateSchema,
  searchQuerySchema,
  searchResultCreateSchema,
  sessionCreateSchema,
  technologyPipelineCreateSchema,
  topResultCreateSchema,
  userChoiceCreateSchema,
  userCreateSchema,
  userLoginSchema,
  userTopResultCreateSchema,
  userUpdateSchema,
  verificationCreateSchema,
  type AccountCreateInput,
  type ApiIntegrationCreateInput,
  type ApiResponse,
  type ClothesPipelineCreateInput,
  type DrugsPipelineCreateInput,
  type FoodPipelineCreateInput,
  type ImageProcessCreateInput,
  type PaginatedResponse,
  type PaginationInput,
  type ProductCategoryCreateInput,
  type ProfileCreateInput,
  type SearchQueryInput,
  type SearchResultCreateInput,
  type SessionCreateInput,
  type TechnologyPipelineCreateInput,
  type TopResultCreateInput,
  type UserChoiceCreateInput,
  type UserCreateInput,
  type UserLoginInput,
  type UserTopResultCreateInput,
  type UserUpdateInput,
  type VerificationCreateInput,
} from './zod.schema';

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
}

/**
 * Generic validation function
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error,
      };
    }
    throw error;
  }
}

/**
 * Safe validation function that doesn't throw
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      errors: result.error,
    };
  }
}

// User validation functions
export const validateUserCreate = (data: unknown) => validateData(userCreateSchema, data);
export const validateUserUpdate = (data: unknown) => validateData(userUpdateSchema, data);
export const validateUserLogin = (data: unknown) => validateData(userLoginSchema, data);

// Session validation functions
export const validateSessionCreate = (data: unknown) => validateData(sessionCreateSchema, data);

// Account validation functions
export const validateAccountCreate = (data: unknown) => validateData(accountCreateSchema, data);

// Profile validation functions
export const validateProfileCreate = (data: unknown) => validateData(profileCreateSchema, data);

// Image Process validation functions
export const validateImageProcessCreate = (data: unknown) => validateData(imageProcessCreateSchema, data);

// Top Result validation functions
export const validateTopResultCreate = (data: unknown) => validateData(topResultCreateSchema, data);

// Product Category validation functions
export const validateProductCategoryCreate = (data: unknown) => validateData(productCategoryCreateSchema, data);

// API Integration validation functions
export const validateApiIntegrationCreate = (data: unknown) => validateData(apiIntegrationCreateSchema, data);

// Pipeline validation functions
export const validateFoodPipelineCreate = (data: unknown) => validateData(foodPipelineCreateSchema, data);
export const validateClothesPipelineCreate = (data: unknown) => validateData(clothesPipelineCreateSchema, data);
export const validateDrugsPipelineCreate = (data: unknown) => validateData(drugsPipelineCreateSchema, data);
export const validateTechnologyPipelineCreate = (data: unknown) => validateData(technologyPipelineCreateSchema, data);

// Search Result validation functions
export const validateSearchResultCreate = (data: unknown) => validateData(searchResultCreateSchema, data);

// User Choice validation functions
export const validateUserChoiceCreate = (data: unknown) => validateData(userChoiceCreateSchema, data);

// User Top Result validation functions
export const validateUserTopResultCreate = (data: unknown) => validateData(userTopResultCreateSchema, data);

// Verification validation functions
export const validateVerificationCreate = (data: unknown) => validateData(verificationCreateSchema, data);

// Query validation functions
export const validatePagination = (data: unknown) => validateData(paginationSchema, data);
export const validateSearchQuery = (data: unknown) => validateData(searchQuerySchema, data);

// Response validation functions
export const validateApiResponse = (data: unknown) => validateData(apiResponseSchema, data);
export const validatePaginatedResponse = (data: unknown) => validateData(paginatedResponseSchema, data);

/**
 * Convert validation errors to a user-friendly format
 */
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  errors.issues.forEach((error) => {
    const field = error.path.join('.');
    formattedErrors[field] = error.message;
  });

  return formattedErrors;
}

/**
 * Convert validation errors to a flat array of error messages
 */
export function getValidationErrorMessages(errors: z.ZodError): string[] {
  return errors.issues.map((error) => error.message);
}

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse {
  return {
    success,
    data,
    error,
    message,
  };
}

/**
 * Create a standardized paginated API response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): PaginatedResponse {
  return {
    success: true,
    data,
    pagination,
  };
}

/**
 * Convert Drizzle table data to Prisma format
 */
export function drizzleToPrisma<T extends Record<string, any>>(
  data: T,
  mapping: Record<string, string>
): Record<string, any> {
  const converted: Record<string, any> = {};

  for (const [drizzleKey, prismaKey] of Object.entries(mapping)) {
    if (drizzleKey in data) {
      converted[prismaKey] = data[drizzleKey];
    }
  }

  return converted;
}

/**
 * Convert Prisma data to Drizzle format
 */
export function prismaToDrizzle<T extends Record<string, any>>(
  data: T,
  mapping: Record<string, string>
): Record<string, any> {
  const converted: Record<string, any> = {};

  for (const [prismaKey, drizzleKey] of Object.entries(mapping)) {
    if (prismaKey in data) {
      converted[drizzleKey] = data[prismaKey];
    }
  }

  return converted;
}

// Common field mappings between Drizzle and Prisma
export const userFieldMapping = {
  // Drizzle -> Prisma
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  emailVerificationToken: 'emailVerificationToken',
  image: 'image',
  password: 'password',
  role: 'role',
  isTwoFactorEnabled: 'isTwoFactorEnabled',
  twoFactorConfirmationId: 'twoFactorConfirmationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
} as const;

export const sessionFieldMapping = {
  // Drizzle -> Prisma
  id: 'id',
  expiresAt: 'expires',
  token: 'sessionToken',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  userId: 'userId',
} as const;

export const accountFieldMapping = {
  // Drizzle -> Prisma
  id: 'id',
  accountId: 'providerAccountId',
  providerId: 'provider',
  userId: 'userId',
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  idToken: 'id_token',
  accessTokenExpiresAt: 'expires_at',
  refreshTokenExpiresAt: 'refreshTokenExpiresAt',
  scope: 'scope',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
} as const;

/**
 * Validate and transform data for database operations
 */
export function validateAndTransform<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  transform?: (data: T) => any
): ValidationResult<any> {
  const validation = validateData(schema, data);

  if (!validation.success) {
    return validation;
  }

  const transformedData = transform ? transform(validation.data!) : validation.data;

  return {
    success: true,
    data: transformedData,
  };
}

// Export types for convenience
export type {
  AccountCreateInput, ApiIntegrationCreateInput, ApiResponse, ClothesPipelineCreateInput,
  DrugsPipelineCreateInput, FoodPipelineCreateInput, ImageProcessCreateInput, PaginatedResponse, PaginationInput, ProductCategoryCreateInput, ProfileCreateInput, SearchQueryInput, SearchResultCreateInput, SessionCreateInput, TechnologyPipelineCreateInput, TopResultCreateInput, UserChoiceCreateInput, UserCreateInput, UserLoginInput, UserTopResultCreateInput, UserUpdateInput, VerificationCreateInput
};

