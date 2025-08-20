"use client";

import * as React from "react";
import Link from "next/link";
import { UploadCloudIcon, FolderIcon, UserIcon } from "@/components/ui/icons";

export default function UploadPage() {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = React.useState<string>("");

  const choose = () => inputRef.current?.click();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // live preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(String(ev.target?.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-[#FFF6E6] text-black">
      {/* Top bar */}
      <div className="mx-auto w-full max-w-[1280px] px-6 pt-6">
        <header className="mb-8 flex items-center justify-between">
          {/* Logo text placeholder (swap to your image if you have one) */}
          <h1 className="text-[28px] font-semibold leading-[1] text-[#5865F2]">
            Product<br />Decoder
          </h1>

          <nav className="flex items-center gap-8 text-[22px] font-semibold">
            <Link href="/upload" className="text-[#CE673A]">Image upload</Link>
            <Link href="#" className="text-black">Saved searches</Link>
            <Link href="/" className="text-black">Home</Link>

            <div className="ml-2 flex items-center gap-3">
              {/* Avatar button */}
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#FFD671]">
                <UserIcon className="h-8 w-8" />
              </div>

              {/* Log Out pill */}
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

      {/* Big purple panel */}
      <section className="mx-auto w-full max-w-[1280px] px-6">
        <div
          className="
            mx-auto
            rounded-[20px]
            bg-[#5865F2]
            px-5
            py-10
          "
          style={{ width: "1105px", height: "545px" }}
        >
          {/* Inner dashed drop zone (660 x 321 from your Inspect) */}
          <div
            className="
              mx-auto flex h-[321px] w-[660px] flex-col items-center justify-center
              rounded-[12px] border-2 border-dashed
            "
            style={{ borderColor: "rgba(255, 246, 230, 0.8)" }}
          >
            {/* Yellow circular icon */}
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD671]">
              <UploadCloudIcon className="h-6 w-6 text-[#5865F2]" />
            </div>

            {/* Copy */}
            <p className="text-center text-[17px] font-semibold leading-7 text-[#FFF6E6]">
              Drop your image here
            </p>
            <p className="mt-1 text-center text-[12px] leading-5 text-[#FFF6E6]">
              or click to browse from your device
            </p>

            {/* Hidden input + CTA button */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={choose}
              className="
                mt-4 inline-flex items-center justify-center gap-2
                rounded-[6px] bg-[#CE673A] px-4 py-2 text-[13.5px] font-medium text-white
              "
              aria-label="Choose File"
            >
              <FolderIcon className="h-4 w-4" />
              Choose File
            </button>
          </div>
        </div>

        {/* Preview (only shows after picking a file) */}
        {preview && (
          <div className="mx-auto mt-8 w-full max-w-[1105px] rounded-xl border bg-white p-4">
            <div className="mb-2 text-sm text-neutral-600">Preview</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Selected preview"
              className="max-h-[420px] w-full rounded-lg object-contain"
            />
          </div>
        )}
      </section>
    </main>
  );
}
