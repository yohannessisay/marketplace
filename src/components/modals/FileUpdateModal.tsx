"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
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
import { APIErrorResponse } from "@/types/api";

interface FileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  mode: "contract" | "documents" | "payment_slip";
  onUploadSuccess: () => void;
  xfmrId?: string;
}

interface Document {
  key: string;
  url: string;
  type: "image" | "pdf";
  name?: string;
  isTemp?: boolean; // Flag to indicate temporary file
}

type DocumentLabelKeys =
  | "commercial_invoice"
  | "packing_list"
  | "certificate_of_origin"
  | "phytosanitary_certificate"
  | "bill_of_lading"
  | "ico"
  | "contract"
  | "payment_slip";

export function FileUpdateModal({
  isOpen,
  onClose,
  orderId,
  mode,
  onUploadSuccess,
  xfmrId,
}: FileUpdateModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errorMessage } = useNotification();
  const prevFetchKeyRef = useRef<string | null>(null);
  const tempUrlsRef = useRef<string[]>([]);

  const documentLabels = useMemo(
    () => ({
      commercial_invoice: "Commercial Invoice",
      packing_list: "Packing List",
      certificate_of_origin: "Electronic Certificate of Origin",
      phytosanitary_certificate: "Phytosanitary Certificate",
      bill_of_lading: "B/L",
      ico: "ICO",
      contract: "Contract",
      payment_slip: "Payment Slip",
    }),
    [],
  );

  const getDocumentLabel = useCallback(
    (key: string): string => {
      return documentLabels[key as DocumentLabelKeys] || key;
    },
    [documentLabels],
  );

  const handleFetchError = useCallback(
    (err: unknown) => {
      errorMessage(err as APIErrorResponse);
      setDocuments([]);
      setSelectedDocument(null);
    },
    [errorMessage],
  );

  const hasChanges = useMemo(() => {
    if (mode === "documents") {
      return Object.keys(files).length > 0;
    } else {
      return mode === "contract"
        ? !!files.contract
        : mode === "payment_slip"
          ? !!files.payment_slip
          : false;
    }
  }, [files, mode]);

  const fetchDocuments = useCallback(
    async (orderId: string, mode: string) => {
      if (!orderId) {
        handleFetchError(new Error("Order ID is missing"));
        return;
      }

      setIsLoading(true);
      try {
        let fetchedDocs: Document[] = [];

        if (mode === "documents") {
          const documentsResponse: any = await apiService().get(
            `/orders/get-documents?orderId=${orderId}`,
            xfmrId,
          );

          if (Array.isArray(documentsResponse.data.documents)) {
            fetchedDocs = documentsResponse.data.documents.map((doc: any) => ({
              key: doc.type,
              url: doc.url,
              type: doc.name?.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
              name: doc.name,
            }));
          }
        } else if (mode === "contract") {
          const response: any = await apiService().get(
            `/orders/get-contract?orderId=${orderId}`,
            xfmrId,
          );
          fetchedDocs = [
            {
              key: "contract",
              url: response.data.contract.url,
              type: response.data.type || "pdf",
              name: response.data.contract.name,
            },
          ];
        } else if (mode === "payment_slip") {
          const response: any = await apiService().get(
            `/orders/get-payment-slip?orderId=${orderId}`,
            xfmrId,
          );
          fetchedDocs = [
            {
              key: "payment_slip",
              url: response.data.payment_slip.url,
              type: response.data.type || "pdf",
              name: response.data.payment_slip.name,
            },
          ];
        }

        setDocuments(fetchedDocs);
        setSelectedDocument(fetchedDocs[0] || null);
      } catch (err) {
        handleFetchError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [handleFetchError, xfmrId],
  );

  useEffect(() => {
    if (!isOpen) return;

    const fetchKey = `${orderId}-${mode}`;
    if (fetchKey === prevFetchKeyRef.current) return;

    prevFetchKeyRef.current = fetchKey;
    fetchDocuments(orderId, mode);
  }, [isOpen, orderId, mode, fetchDocuments]);

  useEffect(() => {
    if (!isOpen) {
      tempUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      tempUrlsRef.current = [];
      setDocuments([]);
      setSelectedDocument(null);
      setFiles({});
      setIsLoading(false);
      setIsSubmitting(false);
      prevFetchKeyRef.current = null;
    }
  }, [isOpen]);

  const handleFilesSelected = useCallback(
    (fieldKey: string, selectedFiles: File[]) => {
      const file = selectedFiles[0];
      if (!file) return;

      if (selectedDocument?.isTemp && selectedDocument?.key === fieldKey) {
        URL.revokeObjectURL(selectedDocument.url);
        tempUrlsRef.current = tempUrlsRef.current.filter(
          (url) => url !== selectedDocument.url,
        );
      }

      const tempUrl = URL.createObjectURL(file);
      tempUrlsRef.current.push(tempUrl);

      const isPdf =
        file.name.toLowerCase().endsWith(".pdf") ||
        file.type === "application/pdf";
      const type: "image" | "pdf" = isPdf ? "pdf" : "image";

      setSelectedDocument({
        key: fieldKey,
        url: tempUrl,
        type,
        name: file.name,
        isTemp: true,
      });

      setFiles((prev) => ({
        ...prev,
        [fieldKey]: file,
      }));
    },
    [selectedDocument],
  );

  const handleDocumentSelect = useCallback(
    (doc: Document) => {
      if (selectedDocument?.isTemp) {
        URL.revokeObjectURL(selectedDocument.url);
        tempUrlsRef.current = tempUrlsRef.current.filter(
          (url) => url !== selectedDocument.url,
        );
      }
      setSelectedDocument(doc);
    },
    [selectedDocument],
  );

  const handleDownload = useCallback(
    (doc: Document, openInNewTab: boolean = false) => {
      if (openInNewTab) {
        window.open(doc.url, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = doc.url;
        link.download = `${getDocumentLabel(doc.key)}.${doc.type === "pdf" ? "pdf" : "jpg"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    [getDocumentLabel],
  );

  const handleSubmit = async () => {
    if (mode === "contract" && !files.contract) {
      errorMessage({ error: { message: "Please select a new contract file" } });
      return;
    }

    if (mode === "payment_slip" && !files.payment_slip) {
      errorMessage({
        error: { message: "Please select a new payment slip file" },
      });
      return;
    }

    if (mode === "documents" && Object.keys(files).length === 0) {
      errorMessage({
        error: { message: "Please select at least one new document" },
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
        tempUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        tempUrlsRef.current = [];
        onUploadSuccess();
        onClose();
        setFiles({});
      } else {
        throw new Error(response.error?.message || "Update failed");
      }
    } catch (err: any) {
      errorMessage(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1200px] h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            {mode === "contract"
              ? "Update Contract"
              : mode === "payment_slip"
                ? "Update Payment Slip"
                : "Update Documents"}
          </DialogTitle>
          <DialogDescription>
            {mode === "contract"
              ? "View the current contract and upload a new one to replace it."
              : mode === "payment_slip"
                ? "View the current payment slip and upload a new one to replace it."
                : "View current documents and upload new ones to replace them."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-[calc(90vh-120px)] overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r bg-gray-50 p-4 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Current Documents
            </h3>
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="h-12 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <div
                    key={doc.key}
                    className={`flex items-center justify-between p-2 rounded-lg mb-2 transition-colors ${
                      selectedDocument?.key === doc.key &&
                      !selectedDocument.isTemp
                        ? "bg-primary text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    <Button
                      variant="link"
                      className="flex-1 justify-start text-left h-auto p-2 text-sm"
                      onClick={() => handleDocumentSelect(doc)}
                    >
                      <FileText
                        className={`h-4 w-4 mr-2 ${
                          selectedDocument?.key === doc.key &&
                          !selectedDocument.isTemp
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`${
                          selectedDocument?.key === doc.key &&
                          !selectedDocument.isTemp
                            ? "text-white"
                            : "text-gray-700"
                        } truncate`}
                      >
                        {getDocumentLabel(doc.key)}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc, true);
                      }}
                      className={`${
                        selectedDocument?.key === doc.key &&
                        !selectedDocument.isTemp
                          ? "text-white"
                          : "text-gray-500 hover:text-primary"
                      }`}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No documents available</p>
              )}
            </div>
          </div>
          {/* Main Content: Preview and Upload */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedDocument ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-800 max-w-[70%] truncate">
                    {selectedDocument.isTemp
                      ? `New ${getDocumentLabel(selectedDocument.key)} (Preview)`
                      : getDocumentLabel(selectedDocument.key)}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedDocument)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden mb-4">
                  {selectedDocument.type === "pdf" ? (
                    <iframe
                      src={selectedDocument.url}
                      className="w-full h-full border rounded-lg shadow-sm"
                      title={getDocumentLabel(selectedDocument.key)}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <img
                        src={selectedDocument.url}
                        alt={getDocumentLabel(selectedDocument.key)}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-3 border rounded-lg min-h-[200px] pb-8 scroll-mt-4">
                  <h3 className="text-sm font-medium text-foreground">
                    Upload New {getDocumentLabel(selectedDocument.key)}
                  </h3>
                  <FileUpload
                    onFilesSelected={(selectedFiles) =>
                      handleFilesSelected(selectedDocument.key, selectedFiles)
                    }
                    maxFiles={1}
                    maxSizeMB={10}
                    className="w-full"
                  />
                  {files[selectedDocument.key] && (
                    <p className="text-xs text-muted-foreground truncate">
                      Selected: {files[selectedDocument.key]?.name}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No document selected</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasChanges}
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
                  Updating...
                </span>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
