"use client";

import type React from "react";
import { useState, useRef, type DragEvent, useEffect } from "react";
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
    
    // Check if the files array is empty
    if (filesArray.length === 0) {
      setFiles([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const { valid, error } = validateFiles(filesArray);

    if (error) {
      setError(error);
      return;
    }

    if (valid.length === 0) {
      setFiles([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    
    // Clean up URL objects to prevent memory leaks
    URL.revokeObjectURL(files[indexToRemove].preview);
    
    // Reset everything if no files remain
    if (updatedFiles.length === 0) {
      setFiles([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';  // Reset the file input
      }
    } else {
      setFiles(updatedFiles);
    }

    if (onFilesSelected) {
      onFilesSelected(updatedFiles.map((f) => f.file));
    }
  };

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300",
          "transition-colors duration-200",
          "relative"
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
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="h-10 w-10 text-gray-400" />
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              className="text-primary hover:text-primary/80"
              onClick={() => fileInputRef.current?.click()}
            >
              Click to upload
            </Button>
            <span className="text-gray-500"> or drag and drop</span>
          </div>
          <p className="text-sm text-gray-500">
            PDF or images up to {maxSizeMB}MB
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            {files.map((file, index) => (
              <div
                key={index}
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
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">{file.file.name}</p>
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
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
