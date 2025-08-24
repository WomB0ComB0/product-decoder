// Clerk authentication configuration
// This file exports Clerk utilities and configurations

import { currentUser } from "@clerk/nextjs/server";

export { currentUser } from "@clerk/nextjs/server";
export { clerkClient } from "@clerk/nextjs/server";

// Re-export client-side hooks for convenience
export { useUser, useAuth, useClerk } from "@clerk/nextjs";

// Helper function to get user data
export async function getUser() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
