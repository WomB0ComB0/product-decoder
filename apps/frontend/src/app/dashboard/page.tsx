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
import UploadExample from "@/components/upload/UploadExample";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();

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
    <div className="flex flex-col items-center gap-8 p-8 w-full max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Upload / Dashboard</h1>

      {/* Render the upload demo as the primary dashboard surface */}
      <UploadExample />

      <div className="mt-6">
        <SignOutButton>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
