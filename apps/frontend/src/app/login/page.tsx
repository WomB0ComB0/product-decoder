"use client";

import { useQueryClient } from "@tanstack/react-query";
import { GalleryVerticalEnd, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl") || "/dashboard";
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage("");

    authClient.signIn.email(
      {
        email,
        password,
        callbackURL: redirectUrl,
      },
      {
        onError: (ctx) => {
          setErrorMessage(ctx.error.message);
          setIsLoading(false);
        },
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["user"] });
          router.push(redirectUrl);
        },
      },
    );
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a href="#" className="flex flex-col items-center gap-2 font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">Acme Inc.</span>
              </a>
              <h1 className="text-xl font-bold">Welcome back to Acme Inc.</h1>
            </div>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="hello@example.com"
                  readOnly={isLoading}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password here"
                  readOnly={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full" size="lg" disabled={isLoading}>
                {isLoading && <LoaderCircle className="animate-spin" />}
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            {errorMessage && (
              <span className="text-destructive text-center text-sm">{errorMessage}</span>
            )}
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Or
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
                onClick={() =>
                  authClient.signIn.social(
                    {
                      provider: "github",
                      callbackURL: redirectUrl,
                    },
                    {
                      onRequest: () => {
                        setIsLoading(true);
                        setErrorMessage("");
                      },
                      onError: (ctx) => {
                        setIsLoading(false);
                        setErrorMessage(ctx.error.message);
                      },
                    },
                  )
                }
              >
                Continue with Google
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
                onClick={() =>
                  authClient.signIn.social(
                    {
                      provider: "google",
                      callbackURL: redirectUrl,
                    },
                    {
                      onRequest: () => {
                        setIsLoading(true);
                        setErrorMessage("");
                      },
                      onError: (ctx) => {
                        setIsLoading(false);
                        setErrorMessage(ctx.error.message);
                      },
                    },
                  )
                }
              >
                Continue with GitHub
              </Button>
            </div>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <a href="/signup" className="underline">
                Sign up
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
