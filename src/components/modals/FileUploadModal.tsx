"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/common/file-upload";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  mode: "contract" | "documents" | "payment_slip";
  onUploadSuccess: () => void;
  xfmrId?: string;
}

const documentFields = [
  { key: "commercial_invoice", label: "Commercial Invoice" },
  { key: "packing_list", label: "Packing List" },
  { key: "certificate_of_origin", label: "Certificate of Origin" },
  { key: "phytosanitary_certificate", label: "Phytosanitary Certificate" },
  { key: "bill_of_lading", label: "Bill of Lading" },
  { key: "ico", label: "ICO" },
] as const;

export function FileUploadModal({
  xfmrId,
  isOpen,
  onClose,
  orderId,
  mode,
  onUploadSuccess,
}: FileUploadModalProps) {
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errorMessage } = useNotification();

  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      setFiles((prev) => ({
        ...prev,
        [mode === "contract" ? "contract" : "payment_slip"]: selectedFiles[0],
      }));
    },
    [mode],
  );

  const handleDocumentSelected = useCallback(
    (fieldKey: string, selectedFiles: File[]) => {
      setFiles((prev) => ({ ...prev, [fieldKey]: selectedFiles[0] }));
    },
    [],
  );

  const handleSubmit = async () => {
    if (mode === "contract" && !files.contract) {
      errorMessage({ error: { message: "Please select a contract file" } });
      return;
    }

    if (mode === "payment_slip" && !files.payment_slip) {
      errorMessage({ error: { message: "Please select a payment slip file" } });
      return;
    }

    if (mode === "documents" && Object.keys(files).length === 0) {
      errorMessage({
        error: { message: "Please select at least one document" },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (mode === "contract") {
        formData.append("contract", files.contract);
      } else if (mode === "payment_slip") {
        formData.append("payment_slip", files.payment_slip);
      } else {
        Object.entries(files).forEach(([key, file]) => {
          if (file) {
            formData.append(key, file);
          }
        });
      }

      const endpoint =
        mode === "contract"
          ? `/orders/upload-contract?orderId=${orderId}`
          : mode === "payment_slip"
            ? `/orders/upload-payment-slip?orderId=${orderId}`
            : `/orders/upload-documents?orderId=${orderId}`;

      const response: any = await apiService().postFormData(
        endpoint,
        formData,
        true,
        xfmrId,
      );

      if (response.success) {
        onUploadSuccess();
        onClose();
        setFiles({});
      } else {
        throw new Error(response.error?.message || "Upload failed");
      }
    } catch (err: any) {
      errorMessage(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === "contract"
              ? "Upload Contract"
              : mode === "payment_slip"
                ? "Upload Payment Slip"
                : "Upload Documents"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "contract"
              ? "Upload an initial contract for you and the buyer to agree to"
              : mode === "payment_slip"
                ? "Upload the payment slip for this order"
                : "Upload all required shipping documents"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {mode === "contract" || mode === "payment_slip" ? (
            <div className="space-y-2 p-3 border rounded-lg">
              <h3 className="text-sm font-medium text-foreground">
                {mode === "contract" ? "Contract" : "Payment Slip"}
              </h3>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                maxFiles={1}
                maxSizeMB={10}
                className="w-full"
              />
              {files[mode === "contract" ? "contract" : "payment_slip"] && (
                <p className="text-xs text-muted-foreground truncate">
                  Selected:{" "}
                  {
                    files[mode === "contract" ? "contract" : "payment_slip"]
                      ?.name
                  }
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentFields.map((field) => (
                <div
                  key={field.key}
                  className="space-y-2 p-3 border rounded-lg"
                >
                  <h3 className="text-sm font-medium text-foreground">
                    {field.label}
                  </h3>
                  <FileUpload
                    onFilesSelected={(selectedFiles) =>
                      handleDocumentSelected(field.key, selectedFiles)
                    }
                    maxFiles={1}
                    maxSizeMB={10}
                    className="w-full"
                  />
                  {files[field.key] && (
                    <p className="text-xs text-muted-foreground truncate">
                      Selected: {files[field.key]?.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75"
                    />
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
