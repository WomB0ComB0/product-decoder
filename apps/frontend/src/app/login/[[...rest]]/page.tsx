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
