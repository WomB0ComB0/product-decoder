/**
 * Copyright 2025 Mike Odnis
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div>Please sign in to access the dashboard</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Welcome to Product Decoder Dashboard</h1>
      
      <div className="bg-card text-card-foreground rounded-md border p-4 max-w-md">
        <h2 className="text-lg font-semibold mb-2">User Information</h2>
        <div className="space-y-2">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      </div>

      <SignOutButton>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
          Sign Out
        </button>
      </SignOutButton>
    </div>
  );
}
