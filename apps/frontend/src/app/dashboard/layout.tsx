"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth/functions/get-user";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login?redirectUrl=/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Dashboard Layout</h1>
        <div className="flex items-center gap-2 max-sm:flex-col">
          This is a protected layout:
          <pre className="bg-card text-card-foreground rounded-md border p-1">
            app/dashboard/layout.tsx
          </pre>
        </div>

        <Button type="button" asChild className="w-fit" size="lg">
          <Link href="/">Back to index</Link>
        </Button>
      </div>

      {children}
    </div>
  );
}
