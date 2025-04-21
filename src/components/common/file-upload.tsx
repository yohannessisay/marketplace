"use client";

import type React from "react";
import { useState, useRef, type DragEvent } from "react";
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
};

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 5,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFiles = (
    fileList: File[],
  ): { valid: File[]; error: string | null } => {
    const validFiles: File[] = [];
    let errorMessage: string | null = null;

    // Check if adding these files would exceed the max files limit
    if (files.length + fileList.length > maxFiles) {
      return {
        valid: [],
        error: `You can only upload a maximum of ${maxFiles} files.`,
      };
    }

    for (const file of fileList) {
      // Check file type
      if (!file.type.match("image.*") && file.type !== "application/pdf") {
        errorMessage = "Only images and PDF files are allowed.";
        continue;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        errorMessage = `File size should not exceed ${maxSizeMB}MB.`;
        continue;
      }

      validFiles.push(file);
    }

    return { valid: validFiles, error: errorMessage };
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    const { valid, error } = validateFiles(filesArray);

    if (error) {
      setError(error);
      return;
    }

    if (valid.length === 0) return;

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

    const updatedFiles = [...files, ...newFilesWithPreview];
    setFiles(updatedFiles);
    setError(null);

    if (onFilesSelected) {
      onFilesSelected(updatedFiles.map((f) => f.file));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
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
    setFiles(updatedFiles);

    if (onFilesSelected) {
      onFilesSelected(updatedFiles.map((f) => f.file));
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-muted/50"
            : "border-muted-foreground/25 hover:border-primary/50",
          "flex flex-col items-center justify-center gap-2",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          multiple
        />
        <Upload className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          PDF and images only (max {maxFiles} files, up to {maxSizeMB}MB each)
        </p>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <div
              key={`${file.file.name}-${index}`}
              className="relative group border rounded-lg overflow-hidden"
            >
              <div className="aspect-square flex items-center justify-center bg-muted/30">
                {file.type === "image" ? (
                  <img
                    src={file.preview || "/placeholder.svg"}
                    alt={file.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-2">
                    <FileIcon className="h-8 w-8 text-primary" />
                    <p className="text-xs text-center mt-1 truncate w-full">
                      {file.file.name}
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
