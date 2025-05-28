"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  mode: "contract" | "documents" | "payment_slip";
  xfmrId?: string;
}

interface Document {
  key: string;
  url: string;
  type: "image" | "pdf";
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

export function FilePreviewModal({
  isOpen,
  onClose,
  mode,
  orderId,
  xfmrId,
}: FilePreviewModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { errorMessage } = useNotification();
  const prevFetchKeyRef = useRef<string | null>(null);

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
            }));
          }

          try {
            const contractResponse: any = await apiService().get(
              `/orders/get-contract?orderId=${orderId}`,
              xfmrId,
            );
            fetchedDocs.push({
              key: "contract",
              url: contractResponse.data.contract.url,
              type: contractResponse.data.type || "pdf",
            });
          } catch (contractErr) {
            console.warn("Failed to fetch contract:", contractErr);
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
      setDocuments([]);
      setSelectedDocument(null);
      setIsLoading(false);
      prevFetchKeyRef.current = null;
    }
  }, [isOpen]);

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

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[1200px] max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden p-0">
        <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            {mode === "contract"
              ? "View Contract"
              : mode === "payment_slip"
                ? "View Payment Slip"
                : "View Documents"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row h-[calc(90vh-80px)] sm:h-[calc(90vh-96px)] overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r bg-gray-50 p-4 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Documents
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
                      selectedDocument?.key === doc.key
                        ? "bg-primary text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    <Button
                      variant="link"
                      className="flex-1 justify-start text-left h-auto p-2 text-sm truncate"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <FileText
                        className={`h-4 w-4 mr-2 flex-shrink-0 ${
                          selectedDocument?.key === doc.key
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`truncate ${
                          selectedDocument?.key === doc.key
                            ? "text-white"
                            : "text-gray-700"
                        }`}
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
                      className={`flex-shrink-0 ${
                        selectedDocument?.key === doc.key
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
          {/* Preview Area */}
          <div
            className={`flex-1 p-4 sm:p-6 overflow-hidden ${
              mode === "documents" ? "hidden lg:block" : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedDocument ? (
              <div className="h-full flex flex-col overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <h4 className="text-base sm:text-lg font-medium text-gray-800 max-w-[70%] truncate">
                    {getDocumentLabel(selectedDocument.key)}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedDocument)}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden rounded-lg shadow-sm">
                  {selectedDocument.type === "pdf" ? (
                    <iframe
                      src={selectedDocument.url}
                      className="w-full h-full border rounded-lg"
                      title={getDocumentLabel(selectedDocument.key)}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <img
                        src={selectedDocument.url}
                        alt={getDocumentLabel(selectedDocument.key)}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm sm:text-base">
                  No document selected
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
