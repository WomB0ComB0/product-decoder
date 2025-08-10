/**
 * Example Usage of Zod Schemas
 * 
 * This file demonstrates how to use the Zod schemas for validation
 * in various parts of your application.
 */

import {
  // Schemas
  userCreateSchema,
  userLoginSchema,
  sessionCreateSchema,
  profileCreateSchema,
  imageProcessCreateSchema,
  paginationSchema,
  searchQuerySchema,
  
  // Validation functions
  validateUserCreate,
  validateUserLogin,
  validateSessionCreate,
  validateProfileCreate,
  validateImageProcessCreate,
  validatePagination,
  validateSearchQuery,
  
  // Utility functions
  formatValidationErrors,
  getValidationErrorMessages,
  createApiResponse,
  createPaginatedResponse,
  drizzleToPrisma,
  prismaToDrizzle,
  userFieldMapping,
  sessionFieldMapping,
  
  // Types
  type UserCreateInput,
  type UserLoginInput,
  type ValidationResult,
} from './index';

// Example 1: Form validation in a React component
export function validateUserForm(formData: FormData): ValidationResult<UserCreateInput> {
  const userData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as 'GUEST' | 'MEMBER',
    image: formData.get('image') as string || undefined,
  };
  
  return validateUserCreate(userData);
}

// Example 2: API route validation
export function handleUserRegistration(request: Request) {
  try {
    const body = await request.json();
    const validation = validateUserCreate(body);
    
    if (!validation.success) {
      const errors = formatValidationErrors(validation.errors!);
      return new Response(
        JSON.stringify(createApiResponse(false, null, 'Validation failed', 'Invalid user data')),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Proceed with user creation
    const userData = validation.data!;
    // ... create user logic
    
    return new Response(
      JSON.stringify(createApiResponse(true, { id: 'user-id' }, undefined, 'User created successfully')),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify(createApiResponse(false, null, 'Internal server error')),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Example 3: Login validation
export function handleUserLogin(request: Request) {
  try {
    const body = await request.json();
    const validation = validateUserLogin(body);
    
    if (!validation.success) {
      const errorMessages = getValidationErrorMessages(validation.errors!);
      return new Response(
        JSON.stringify(createApiResponse(false, null, 'Invalid credentials', errorMessages.join(', '))),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const loginData = validation.data!;
    // ... login logic
    
    return new Response(
      JSON.stringify(createApiResponse(true, { token: 'jwt-token' }, undefined, 'Login successful')),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify(createApiResponse(false, null, 'Internal server error')),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Example 4: Session creation with IP and user agent
export function handleSessionCreation(userId: string, request: Request) {
  const sessionData = {
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    token: crypto.randomUUID(),
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    userAgent: request.headers.get('user-agent'),
  };
  
  const validation = validateSessionCreate(sessionData);
  
  if (!validation.success) {
    throw new Error('Invalid session data');
  }
  
  return validation.data!;
}

// Example 5: Profile creation with address
export function handleProfileCreation(userId: string, profileData: any) {
  const fullProfileData = {
    userId,
    role: 'MEMBER',
    active: true,
    version: '1.0.0',
    photoUrl: profileData.photoUrl,
    address: profileData.address ? {
      line1: profileData.address.line1,
      line2: profileData.address.line2,
      city: profileData.address.city,
      province: profileData.address.province,
      country: profileData.address.country,
      zip: profileData.address.zip,
    } : undefined,
  };
  
  const validation = validateProfileCreate(fullProfileData);
  
  if (!validation.success) {
    const errors = formatValidationErrors(validation.errors!);
    throw new Error(`Profile validation failed: ${JSON.stringify(errors)}`);
  }
  
  return validation.data!;
}

// Example 6: Image process creation
export function handleImageProcessCreation(userId: string, imageUrl: string) {
  const imageProcessData = {
    userId,
    imageUrl,
    processedAt: new Date(),
  };
  
  const validation = validateImageProcessCreate(imageProcessData);
  
  if (!validation.success) {
    throw new Error('Invalid image process data');
  }
  
  return validation.data!;
}

// Example 7: Pagination and search
export function handleSearchRequest(url: URL) {
  const paginationData = {
    page: parseInt(url.searchParams.get('page') || '1'),
    limit: parseInt(url.searchParams.get('limit') || '10'),
    sortBy: url.searchParams.get('sortBy') || undefined,
    sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
  
  const searchData = {
    query: url.searchParams.get('query') || '',
    category: url.searchParams.get('category') || undefined,
    filters: url.searchParams.get('filters') ? JSON.parse(url.searchParams.get('filters')!) : undefined,
  };
  
  const paginationValidation = validatePagination(paginationData);
  const searchValidation = validateSearchQuery(searchData);
  
  if (!paginationValidation.success || !searchValidation.success) {
    throw new Error('Invalid pagination or search parameters');
  }
  
  return {
    pagination: paginationValidation.data!,
    search: searchValidation.data!,
  };
}

// Example 8: Converting between Drizzle and Prisma formats
export function convertDrizzleUserToPrisma(drizzleUser: any) {
  return drizzleToPrisma(drizzleUser, userFieldMapping);
}

export function convertPrismaUserToDrizzle(prismaUser: any) {
  return prismaToDrizzle(prismaUser, userFieldMapping);
}

export function convertDrizzleSessionToPrisma(drizzleSession: any) {
  return drizzleToPrisma(drizzleSession, sessionFieldMapping);
}

export function convertPrismaSessionToDrizzle(prismaSession: any) {
  return prismaToDrizzle(prismaSession, sessionFieldMapping);
}

// Example 9: React form validation hook
export function useFormValidation<T>(schema: any) {
  return {
    validate: (data: unknown): ValidationResult<T> => {
      try {
        const validatedData = schema.parse(data);
        return {
          success: true,
          data: validatedData,
        };
      } catch (error) {
        if (error instanceof Error && 'errors' in error) {
          return {
            success: false,
            errors: error as any,
          };
        }
        throw error;
      }
    },
    
    validateField: (field: string, value: any) => {
      try {
        schema.shape[field].parse(value);
        return { success: true };
      } catch (error) {
        if (error instanceof Error && 'errors' in error) {
          return {
            success: false,
            error: (error as any).errors[0]?.message,
          };
        }
        throw error;
      }
    },
  };
}

// Example 10: API response handling
export function handleApiResponse<T>(response: Response): Promise<T> {
  return response.json().then((data) => {
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    return data.data;
  });
}

// Example 11: Error handling with validation
export function handleValidationError(error: any) {
  if (error.name === 'ZodError') {
    const formattedErrors = formatValidationErrors(error);
    return {
      type: 'validation',
      errors: formattedErrors,
      messages: getValidationErrorMessages(error),
    };
  }
  
  return {
    type: 'unknown',
    error: error.message || 'An unknown error occurred',
  };
}

// Example 12: Middleware for API routes
export function withValidation<T>(schema: any, handler: (data: T) => Promise<Response>) {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const validation = validateData(schema, body);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify(createApiResponse(false, null, 'Validation failed')),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return await handler(validation.data!);
    } catch (error) {
      return new Response(
        JSON.stringify(createApiResponse(false, null, 'Internal server error')),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

// Example usage of the middleware
export const createUserHandler = withValidation(userCreateSchema, async (userData: UserCreateInput) => {
  // User data is already validated here
  // ... create user logic
  
  return new Response(
    JSON.stringify(createApiResponse(true, { id: 'user-id' }, undefined, 'User created')),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
});
