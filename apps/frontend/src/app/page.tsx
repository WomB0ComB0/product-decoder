"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import authClient from "~/lib/auth/auth-client";
import { useUser } from "~/lib/auth/functions/get-user";

export default function Home() {
  const { data: user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">React TanStarter</h1>
        <div className="flex items-center gap-2 max-sm:flex-col">
          This is an unprotected page:
          <pre className="bg-card text-card-foreground rounded-md border p-1">
            app/page.tsx
          </pre>
        </div>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-2">
          <p>Welcome back, {user.name}!</p>
          <Button type="button" asChild className="mb-2 w-fit" size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <div className="text-center text-xs sm:text-sm">
            Session user:
            <pre className="max-w-screen overflow-x-auto px-2 text-start">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <Button
            onClick={async () => {
              await authClient.signOut();
              await queryClient.invalidateQueries({ queryKey: ["user"] });
              router.refresh();
            }}
            type="button"
            className="w-fit"
            variant="destructive"
            size="lg"
          >
            Sign out
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p>You are not signed in.</p>
          <Button type="button" asChild className="w-fit" size="lg">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <ThemeToggle />
        <a
          className="text-muted-foreground hover:text-foreground underline"
          href="https://github.com/dotnize/react-tanstarter"
          target="_blank"
          rel="noreferrer noopener"
        >
          dotnize/react-tanstarter
        </a>
      </div>
    </div>
  );
}
