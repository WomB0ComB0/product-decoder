"use client";

import * as React from "react";
import Link from "next/link";
import { UserIcon } from "@/components/ui/icons";
import ImageUploader from "@/components/ImageUploader"; // ✅ import your component

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-[#FFF6E6] text-black">
      {/* Top bar */}
      <div className="mx-auto w-full max-w-[1280px] px-6 pt-6">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-[28px] font-semibold leading-[1] text-[#5865F2]">
            Product<br />Decoder
          </h1>

          <nav className="flex items-center gap-8 text-[22px] font-semibold">
            <Link href="/upload" className="text-[#CE673A]">Image upload</Link>
            <Link href="#" className="text-black">Saved searches</Link>
            <Link href="/" className="text-black">Home</Link>

            <div className="ml-2 flex items-center gap-3">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#FFD671]">
                <UserIcon className="h-8 w-8" />
              </div>

              <button
                type="button"
                className="h-11 w-[100px] rounded-[10px] bg-[#FFD671] text-[15px] font-semibold text-[#5865F2]"
              >
                Log Out
              </button>
            </div>
          </nav>
        </header>
      </div>

      {/* Uploader section */}
      <section className="mx-auto w-full max-w-[1280px] px-6">
        <div
          className="
            mx-auto rounded-[20px] bg-[#5865F2] px-5 py-10
          "
          style={{ width: "1105px", height: "545px" }}
        >
          {/* Here we drop in our reusable component */}
          <ImageUploader className="mx-auto flex h-[321px] w-[660px] flex-col items-center justify-center rounded-[12px] border-2 border-dashed" />
        </div>
      </section>
    </main>
  );
}
