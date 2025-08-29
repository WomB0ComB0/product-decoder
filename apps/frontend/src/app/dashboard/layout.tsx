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

import Link from "next/link";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";

function AvatarDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-[var(--highlight-yellow)] flex items-center justify-center border-2 border-[#5865F2]"
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="3" stroke="#5865F2" strokeWidth="1.5" />
          <path d="M4 20c0-3.3137 2.6863-6 6-6h4c3.3137 0 6 2.6863 6 6" stroke="#5865F2" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-[var(--highlight-yellow)] rounded-lg shadow-lg p-2 flex flex-col gap-2">
          <button className="px-3 py-2 text-sm text-[#111827]">Log Out</button>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    redirect("/login/");
  }

  return (
    <div className="min-h-svh flex flex-col bg-[var(--background)]">
      {/* Dashboard-only header: three-column layout */}
      <header className="py-10 w-full">
        <div className="mx-auto max-w-7xl px-6 w-full">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Logo left */}
            <div className="col-span-1 flex items-center">
              <Link href="/">
                <img src="/logo.png" alt="Product Decoder Logo" className="w-44 h-auto" />
              </Link>
            </div>

            {/* Center placeholder (kept for grid balance) */}
            <div className="col-span-1" />

            {/* Right: nav + avatar */}
            <div className="col-span-1 flex justify-end items-center gap-10 relative">
              <nav className="flex items-center gap-10 text-lg font-semibold">
                <Link href="/dashboard" className="text-[#CE673A]">
                  Image upload
                </Link>
                <Link href="/" className="text-[#111827]">
                  Home
                </Link>
              </nav>
              <AvatarDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start gap-10 p-2">
        {children}
      </main>
    </div>
  );
}
