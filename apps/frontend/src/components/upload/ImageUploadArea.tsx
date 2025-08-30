/**
 * Copyright
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

import { Upload, Loader2 } from "lucide-react";
import React, { useCallback, useRef } from "react";

export interface ImageUploadAreaProps {
  isUploading: boolean;
  dragActive: boolean;
  acceptedFormats: string[];
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  isUploading,
  // dragActive,
  acceptedFormats,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className="w-full mx-auto cursor-pointer transition"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      style={{
        backgroundColor: "#5865F2", // blue panel
        borderRadius: 24,
        paddingTop: 36,
        paddingBottom: 36,
        paddingLeft: 40,
        paddingRight: 40,
        boxShadow: "0 18px 36px rgba(0,0,0,0.08)",
        // removed outer outline (teal ring)
        width: "100%",
        maxWidth: "none",
      }}
    >
      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(",")}
        onChange={onFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Inner dashed box */}
      <div
        className="rounded-xl flex flex-col items-center justify-center mx-auto"
        style={{
          border: "3px dashed rgba(255,255,255,0.9)",
          borderRadius: 12,
          paddingTop: 36,
          paddingBottom: 36,
          backgroundColor: "transparent",
          width: "78%",
          minWidth: 420,
          maxWidth: 1100,
        }}
      >
        {/* Yellow circular icon */}
        <div
          className="flex items-center justify-center mb-6"
          style={{ width: 80, height: 80, borderRadius: 9999, backgroundColor: "#FFD671", boxShadow: "0 6px 12px rgba(0,0,0,0.08)" }}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-[#5865F2] animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-[#5865F2]" />
          )}
        </div>

        {/* Text */}
        <h3 className="text-lg font-semibold text-white">Drop your image here</h3>
        <p className="text-sm text-white/90 mt-2">or click to browse from your device</p>

        {/* Orange button */}
        <button
          type="button"
          onClick={handleClick}
          style={{
            backgroundColor: "#CE673A",
            width: 140,
            height: 40,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "0 12px",
            borderRadius: 8,
            boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
            whiteSpace: "nowrap",
            fontSize: 16,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
            <polyline points="16 3 16 7 8 7 8 3" />
            <path d="M12 11v6" />
            <polyline points="9 14 12 11 15 14" />
          </svg>
          <span style={{ color: "white", lineHeight: 1 }}>{"Choose File"}</span>
        </button>
      </div>
    </div>
  );
};

export default ImageUploadArea;

