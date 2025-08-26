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

import { SignIn } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFF0D6" }}>
      <Card className="w-full max-w-md" style={{ backgroundColor: "#FFF6E6", borderColor: "#CE673A" }}>
        <CardContent className="space-y-6 p-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold" style={{ color: "#5865F2" }}>
              Product
            </h1>
            <h1 className="text-4xl font-bold" style={{ color: "#5865F2" }}>
              Decoder
            </h1>
          </div>

          {/* Clerk SignIn Component */}
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: {
                  backgroundColor: "#5865F2",
                  "&:hover": {
                    backgroundColor: "#4752C4"
                  }
                },
                card: {
                  backgroundColor: "transparent",
                  boxShadow: "none"
                },
                headerTitle: {
                  display: "none"
                },
                headerSubtitle: {
                  display: "none"
                }
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
