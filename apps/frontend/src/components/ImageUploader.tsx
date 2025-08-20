"use client";
import * as React from "react";
import { UploadCloudIcon, FolderIcon } from "@/components/ui/icons";

// join helper you already had
function cn(...xs: Array<string | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type Status = "idle" | "uploading" | "success" | "error";

type ImageUploaderProps = {
  className?: string;
  /** Called as soon as a file is chosen (before upload) */
  onFileSelected?: (file: File) => void;
  /** Override API base; defaults to NEXT_PUBLIC_API_URL or localhost:3001 */
  apiBase?: string;
};

export default function ImageUploader({
  className,
  onFileSelected,
  apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string>("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState<string>("");
  const [uploadedUrl, setUploadedUrl] = React.useState<string>("");

  const choose = () => inputRef.current?.click();

  const setChosen = (f: File) => {
    setFile(f);
    setUploadedUrl("");
    setStatus("idle");
    setMessage("");
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(String(ev.target?.result || ""));
    reader.readAsDataURL(f);
    onFileSelected?.(f);
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please choose an image file.");
      return;
    }
    setChosen(f);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please drop an image file.");
      return;
    }
    setChosen(f);
  };

    const upload = async () => {
    if (!file) return;
    setStatus("uploading");
    setMessage("");
    setUploadedUrl("");
    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${apiBase}/api/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);

      // 👇 Explicit response type so TS knows about `url`
      type UploadResp = { url?: string; [k: string]: unknown };
      const data = (await res.json()) as UploadResp;

      setUploadedUrl(data.url ?? "");
      setStatus("success");
      setMessage("Uploaded!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "Upload failed.");
    }
  };
  
  const clear = () => {
    setFile(null);
    setPreview("");
    setUploadedUrl("");
    setStatus("idle");
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Dashed dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          "mx-auto flex h-[321px] w-full max-w-[660px] flex-col items-center justify-center rounded-[12px] border-2 border-dashed p-8 text-center transition",
          drag ? "bg-white/10" : "bg-transparent"
        )}
        style={{ borderColor: "rgba(255, 246, 230, 0.8)" }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && choose()}
        aria-label="Drop your image here or press Enter to browse"
      >
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD671]">
          <UploadCloudIcon className="h-6 w-6 text-[#5865F2]" />
        </div>

        <p className="text-[17px] font-semibold leading-7 text-[#FFF6E6]">
          Drop your image here
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[#FFF6E6]">
          or click to browse from your device
        </p>

        <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />

        <button
          type="button"
          onClick={choose}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#CE673A] px-4 py-2 text-[13.5px] font-medium text-white"
        >
          <FolderIcon className="h-4 w-4 text-white" />
          Choose File
        </button>
      </div>

      {/* Preview + actions */}
      {file && (
        <div className="mx-auto mt-6 flex w-full max-w-[660px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-white/20 ring-1 ring-white/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/95">{file.name}</p>
              <p className="text-xs text-[#FFF6E6]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clear}
              className="rounded-xl border border-white/40 bg-transparent px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={upload}
              disabled={status === "uploading"}
              className="rounded-xl bg-[#CE673A] px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {status === "uploading" ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      {status !== "idle" && (
        <div
          className={cn(
            "mx-auto mt-4 w-full max-w-[660px] rounded-xl border p-3 text-sm",
            status === "success"
              ? "border-white/40 bg-white/10 text-white"
              : "border-red-200 bg-red-50 text-red-700"
          )}
        >
          {status === "success" ? (
            <div className="flex items-center gap-2">
              <span>{message || "Uploaded!"}</span>
              {uploadedUrl && (
                <a
                  className="ml-auto underline underline-offset-4"
                  href={uploadedUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open file
                </a>
              )}
            </div>
          ) : (
            <span>{message}</span>
          )}
        </div>
      )}
    </div>
  );
}
