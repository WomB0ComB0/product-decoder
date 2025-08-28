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

import { AlertCircle, Sparkles } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Import utilities
import EnhancedAIAnalysis from "./AIAnalysisLoader";
import { AIAnalysisPipeline, type PipelineResult } from "./AIAnalysisPipeline";
// Import compartmentalized components
import EmptyState from "./EmptyState";
import FileListHeader from "./FileListHeader";
import {
  formatFileSize,
  type ValidationError,
  validateFile,
} from "./FileValidation";
import ImageCard from "./ImageCard";
import ImageUploadArea from "./ImageUploadArea";

// Enhanced TypeScript interfaces with better documentation
export interface ImageFile {
  file: File;
  preview: string;
  id: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface ImageUploadProps {
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Accepted file formats */
  acceptedFormats?: string[];
  /** Maximum image width */
  maxWidth?: number;
  /** Maximum image height */
  maxHeight?: number;
  /** Callback when files are successfully uploaded */
  onUpload?: (files: ImageFile[]) => void;
  /** Callback when validation errors occur */
  onError?: (errors: ValidationError[]) => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom header title */
  title?: string;
  /** Custom header description */
  description?: string;
  /** Whether to use enhanced AI analysis */
  useEnhancedAnalysis?: boolean;
}

// Custom hook for file management logic
const useFileManagement = () => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const addFiles = useCallback((newFiles: ImageFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setErrors([]);
  }, [files]);

  const setValidationErrors = useCallback((newErrors: ValidationError[]) => {
    setErrors(newErrors);
  }, []);

  return {
    files,
    errors,
    addFiles,
    removeFile,
    clearAll,
    setValidationErrors,
  };
};

// Custom hook for AI analysis state
const useAIAnalysis = () => {
  const [results, setResults] = useState<
    Record<string, PipelineResult | undefined>
  >({});
  const [processingProgress, setProcessingProgress] = useState<
    Record<string, number>
  >({});

  const setResult = useCallback((id: string, result: PipelineResult) => {
    setResults((prev) => ({ ...prev, [id]: result }));
  }, []);

  const removeResult = useCallback((id: string) => {
    setResults((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const clearResults = useCallback(() => {
    setResults({});
    setProcessingProgress({});
  }, []);

  return {
    results,
    processingProgress,
    setResult,
    removeResult,
    clearResults,
    setProcessingProgress,
  };
};

const SecureImageUpload: React.FC<ImageUploadProps> = ({
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxWidth = 4000,
  maxHeight = 4000,
  onUpload,
  onError,
  className = "",
  title = "Upload & Analyze Your Images",
  description = "Drop your images and let our AI provide instant insights, from object detection to nutritional analysis and web research.",
  useEnhancedAnalysis = true,
}) => {
  // Enhanced state management with custom hooks
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { files, errors, addFiles, removeFile, clearAll, setValidationErrors } =
    useFileManagement();
  const {
    results,
    processingProgress,
    setResult,
    removeResult,
    clearResults,
    setProcessingProgress,
  } = useAIAnalysis();

  // Memoized AI pipeline instance
  const aiPipeline = useMemo(() => {
    return new AIAnalysisPipeline(process.env.VITE_FOOD_API_KEY ?? "");
  }, []);

  // Memoized validation function
  const validateAndProcessFile = useCallback(
    async (file: File): Promise<ImageFile | null> => {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const sanitizedFile = new File([file], sanitizedName, {
        type: file.type,
      });

      const errors = await validateFile(
        sanitizedFile,
        maxSize,
        acceptedFormats,
        maxWidth,
        maxHeight,
      );

      if (errors.length > 0) {
        setValidationErrors(errors);
        return null;
      }

      return {
        file: sanitizedFile,
        preview: URL.createObjectURL(sanitizedFile),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        size: sanitizedFile.size,
        type: sanitizedFile.type,
        lastModified: sanitizedFile.lastModified,
      };
    },
    [maxSize, acceptedFormats, maxWidth, maxHeight, setValidationErrors],
  );

  // Enhanced file processing with better error handling
  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      setIsUploading(true);
      setValidationErrors([]);

      // Check file count limit
      if (files.length + files.length > maxFiles) {
        const error: ValidationError = {
          type: "general",
          message: `Cannot upload more than ${maxFiles} files. Current: ${files.length}, Attempting: ${files.length}`,
        };
        setValidationErrors([error]);
        setIsUploading(false);
        onError?.([error]);
        return;
      }

      const processedFiles: ImageFile[] = [];
      const allErrors: ValidationError[] = [];

      // Process files sequentially for better error handling
      for (const file of files) {
        const processedFile = await validateAndProcessFile(file);
        if (processedFile) {
          processedFiles.push(processedFile);
        } else {
          allErrors.push(...errors);
        }
      }

      // Add successfully processed files
      if (processedFiles.length > 0) {
        addFiles(processedFiles);
        onUpload?.(processedFiles);

        // Kick off AI analysis for each file
        processedFiles.forEach((imageFile) => {
          if (useEnhancedAnalysis) {
            // Use enhanced analysis
            setProcessingProgress((prev) => ({ ...prev, [imageFile.id]: 0 }));
          } else {
            // Use traditional analysis
            aiPipeline
              .runPipelineForImage(imageFile)
              .then((result) => setResult(imageFile.id, result))
              .catch((error) => {
                setResult(imageFile.id, {
                  id: imageFile.id,
                  detect: {
                    webEntities: [],
                    fullMatchingImages: [],
                    partialMatchingImages: [],
                    pagesWithMatchingImages: [],
                  },
                  insights: {
                    meta: { primaryQuery: imageFile.file.name, labels: [] },
                    category: "Unknown",
                  },
                  error: String(error),
                });
              })
              .finally(() => {
                setProcessingProgress((prev) => {
                  const copy = { ...prev };
                  delete copy[imageFile.id];
                  return copy;
                });
              });
          }
        });
      }

      if (allErrors.length > 0) {
        onError?.(allErrors);
      }

      setIsUploading(false);
    },
    [
      maxFiles,
      validateAndProcessFile,
      addFiles,
      onUpload,
      onError,
      aiPipeline,
      setResult,
      errors,
      setValidationErrors,
      useEnhancedAnalysis,
    ],
  );

  // Enhanced drag and drop handlers
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) processFiles(files);
    },
    [processFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) processFiles(files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [processFiles],
  );

  // Enhanced file removal with cleanup
  const handleRemoveFile = useCallback(
    (id: string) => {
      removeFile(id);
      removeResult(id);
    },
    [removeFile, removeResult],
  );

  // Enhanced clear all with cleanup
  const handleClearAll = useCallback(() => {
    clearAll();
    clearResults();
  }, [clearAll, clearResults]);

  // Handle AI analysis results
  const handleAnalysisResult = useCallback(
    (result: PipelineResult) => {
      setResult(result.id, result);
      setProcessingProgress((prev) => {
        const copy = { ...prev };
        delete copy[result.id];
        return copy;
      });
    },
    [setResult],
  );

  const handleAnalysisError = useCallback((error: Error) => {
    console.error("AI Analysis error:", error);
    // Handle error appropriately
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  // Memoized header content
  const headerContent = useMemo(
    () => (
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full border border-accent/20">
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            AI-Powered Image Analysis
          </span>
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>
    ),
    [title, description],
  );

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-8 ${className}`}>
      {headerContent}

      <ImageUploadArea
        isUploading={isUploading}
        dragActive={dragActive}
        maxFiles={maxFiles}
        maxSize={maxSize}
        acceptedFormats={acceptedFormats}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onFileSelect={handleFileSelect}
        formatFileSize={formatFileSize}
      />

      {errors.length > 0 && (
        <Alert
          variant="destructive"
          className="border-l-4 border-l-destructive bg-destructive/5 shadow-md"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-base">
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
                  {error.message}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <div className="space-y-6">
          <FileListHeader
            fileCount={files.length}
            maxFiles={maxFiles}
            onClearAll={handleClearAll}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {files.map((imageFile) => {
              const result = results[imageFile.id];
              const progress = processingProgress[imageFile.id];
              const isProcessing = progress !== undefined;

              return (
                <React.Fragment key={imageFile.id}>
                  <ImageCard
                    imageFile={imageFile}
                    result={result}
                    isProcessing={isProcessing}
                    progress={progress}
                    onRemove={handleRemoveFile}
                    formatFileSize={formatFileSize}
                  />
                  {/* Enhanced AI Analysis */}
                  {useEnhancedAnalysis && isProcessing && !result && (
                    <EnhancedAIAnalysis
                      imageFile={imageFile}
                      onResult={handleAnalysisResult}
                      onError={handleAnalysisError}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {files.length === 0 && !isUploading && (
        <EmptyState onUploadClick={() => fileInputRef.current?.click()} />
      )}
    </div>
  );
};

export default SecureImageUpload;
