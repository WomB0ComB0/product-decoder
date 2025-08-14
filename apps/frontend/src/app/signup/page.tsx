"use client";

// import { useQueryClient } from "@tanstack/react-query";
// import { GalleryVerticalEnd, LoaderCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
// import { useRouter, useSearchParams } from "next/navigation";
// import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { authClient } from "@/lib/auth/auth-client";

export default function SignupPage() {
  // const searchParams = useSearchParams();
  // const redirectUrl = searchParams.get("redirectUrl") || "/dashboard";
  // const queryClient = useQueryClient();
  // const router = useRouter();

  // const [isLoading, setIsLoading] = useState(false);
  // const [errorMessaapps/frontend/src/app/page.tsxge, setErrorMessage] = useState("");

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (isLoading) return;

  //   const formData = new FormData(e.currentTarget);
  //   const name = formData.get("name") as string;
  //   const email = formData.get("email") as string;
  //   const password = formData.get("password") as string;
  //   const confirmPassword = formData.get("confirm_password") as string;

  //   if (!name || !email || !password || !confirmPassword) return;

  //   if (password !== confirmPassword) {
  //     setErrorMessage("Passwords do not match");
  //     return;
  //   }

  //   setIsLoading(true);
  //   setErrorMessage("");

  //   authClient.signUp.email(
  //     {
  //       name,
  //       email,
  //       password,
  //       callbackURL: redirectUrl,
  //     },
  //     {
  //       onError: (ctx) => {
  //         setErrorMessage(ctx.error.message);
  //         setIsLoading(false);
  //       },
  //       onSuccess: async () => {
  //         await queryClient.invalidateQueries({ queryKey: ["user"] });
  //         router.push(redirectUrl);
  //       },
  //     },
  //   );
  // };

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

          {/* Form */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: "#CE673A" }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-md bg-white"
                style={{ backgroundColor: "#FFF6E6", borderColor: "#CE673A" }}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: "#CE673A" }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 border rounded-md bg-white"
                style={{ backgroundColor: "#FFF6E6", borderColor: "#CE673A" }}
              />
            </div>

            {/* Sign Up Button */}
            <Button
              className="w-full py-2 px-4 rounded-md text-white font-medium"
              style={{ backgroundColor: "#5865F2" }}
            >
              Sign Up
            </Button>

            {/* Options Dropdown */}
            <Select>
              <SelectTrigger className="w-full" style={{ backgroundColor: "#FFF6E6", borderColor: "#CE673A" }}>
                <SelectValue placeholder="Options" style={{ color: "#CE673A" }} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>

            {/* Social Login Buttons */}
            <div className="flex space-x-4">
              <Button
                className="flex-1 py-2 px-4 rounded-md text-white font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: "#5865F2" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                className="flex-1 py-2 px-4 rounded-md text-white font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: "#5865F2" }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
