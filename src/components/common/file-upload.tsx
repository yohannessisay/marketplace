"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FileIcon, X, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export type FileWithPreview = {
  file: File;
  preview: string;
  type: "image" | "pdf";
};

export type FileUploadProps = {
  onFilesSelected?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
  initialFiles?: FileWithPreview[];
  loading?: boolean;
};

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 5,
  className,
  initialFiles = [],
  loading = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Only set initialFiles on mount, not on every change
  useEffect(() => {
    if (files.length === 0 && initialFiles.length > 0) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFiles = useCallback(
    (fileList: File[]): { valid: File[]; error: string | null } => {
      const validFiles: File[] = [];
      let errorMessage: string | null = null;

      if (files.length + fileList.length > maxFiles) {
        return {
          valid: [],
          error: `You can only upload a maximum of ${maxFiles} files.`,
        };
      }

      for (const file of fileList) {
        if (!file.type.match(/^image\//) && file.type !== "application/pdf") {
          errorMessage =
            "Only images (JPG, PNG, etc.) and PDF files are allowed.";
          continue;
        }

        if (file.size > maxSizeBytes) {
          errorMessage = `File size should not exceed ${maxSizeMB}MB.`;
          continue;
        }

        validFiles.push(file);
      }

      return { valid: validFiles, error: errorMessage };
    },
    [files.length, maxFiles, maxSizeBytes, maxSizeMB],
  );

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const filesArray = Array.from(fileList);
      const { valid, error } = validateFiles(filesArray);

      if (error) {
        setError(error);
        return;
      }

      if (valid.length === 0) {
        setError("No valid files selected");
        return;
      }

      const newFilesWithPreview: FileWithPreview[] = await Promise.all(
        valid.map(async (file) => {
          let preview = "";
          let type: "image" | "pdf" = "image";

          if (file.type === "application/pdf") {
            type = "pdf";
            preview = URL.createObjectURL(file);
          } else if (file.type.startsWith("image/")) {
            type = "image";
            preview = URL.createObjectURL(file);
          }

          return { file, preview, type };
        }),
      );

      const updatedFiles = [...files, ...newFilesWithPreview].slice(
        0,
        maxFiles,
      );
      setFiles(updatedFiles);
      setError(null);

      if (onFilesSelected) {
        onFilesSelected(updatedFiles.map((f) => f.file));
      }

      // Clear file input to allow re-selection of the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [files, maxFiles, onFilesSelected, validateFiles],
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    URL.revokeObjectURL(files[indexToRemove].preview);

    setFiles(updatedFiles);
    setError(null);

    if (onFilesSelected) {
      onFilesSelected(updatedFiles.map((f) => f.file));
    }
  };

  const trimFileName = (name: string, maxLength: number = 40): string => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + "...";
  };

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300",
          "transition-colors duration-200",
          "relative",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          accept="image/*,.pdf"
          multiple={maxFiles > 1}
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full"></div>
            <p className="text-sm text-gray-600">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className="h-10 w-10 text-gray-400" />
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                className="text-primary hover:text-primary/80"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                Click to upload
              </Button>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-sm text-gray-500">
              PDF or images up to {maxSizeMB}MB (max {maxFiles} files)
            </p>
          </div>
        ) : (
          <div className={cn("mt-6 space-y-4", files.length === 0 && "mt-0")}>
            {files.map((file, index) => (
              <div
                key={`${file.file.name}-${index}`}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  {file.type === "pdf" ? (
                    <FileIcon className="h-8 w-8 text-primary" />
                  ) : (
                    <img
                      src={file.preview}
                      alt="preview"
                      className="h-8 w-8 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {trimFileName(file.file.name)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(index)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {files.length < maxFiles && (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                Add More Files
              </Button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
