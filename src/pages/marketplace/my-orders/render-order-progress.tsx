"use client";

import { Card, CardContent } from "@/components/ui/card";
import { OrderProgressStatus } from "@/types/orders";
import { AlertCircle, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "../my-orders";

export const renderOrderProgress = (
  order: Order,
  setModalMode: (mode: "contract" | "documents" | "payment_slip") => void,
  setCurrentOrderId: (orderId: string) => void,
  setUploadModalOpen: (open: boolean) => void,
  setPreviewModalOpen: (open: boolean) => void,
  setUpdateModalOpen: (open: boolean) => void,
) => {
  const steps = [
    { key: OrderProgressStatus.OrderPlaced, label: "Order Placed" },
    { key: OrderProgressStatus.ContractSigned, label: "Contract Signed" },
    {
      key: OrderProgressStatus.ProcessingCompleted,
      label: "Processing Completed",
    },
    {
      key: OrderProgressStatus.ReadyForShipment,
      label: "Ready for Shipment",
    },
    {
      key: OrderProgressStatus.PreShipmentSampleApproved,
      label: "Sample Approved",
    },
    { key: OrderProgressStatus.ContainerLoaded, label: "Container Loaded" },
    {
      key: OrderProgressStatus.ContainerArrivedToPort,
      label: "Arrived to Port",
    },
    {
      key: OrderProgressStatus.DocumentationsCompleted,
      label: "Documents Completed",
    },
    { key: OrderProgressStatus.PaymentCompleted, label: "Payment Completed" },
    { key: OrderProgressStatus.DeliveryCompleted, label: "Delivery Completed" },
  ];

  const currentStepIndex = steps.findIndex(
    (step) => step.key === order.current_progress_status,
  );

  const isDeliveryCompleted =
    order.current_progress_status === OrderProgressStatus.DeliveryCompleted;
  const isOrderPlaced =
    order.current_progress_status === OrderProgressStatus.OrderPlaced;
  const isDocumentationsCompleted =
    order.current_progress_status ===
    OrderProgressStatus.DocumentationsCompleted;
  const isContainerArrivedToPort =
    order.current_progress_status ===
    OrderProgressStatus.ContainerArrivedToPort;

  const handleUploadClick = (
    mode: "contract" | "documents" | "payment_slip",
  ) => {
    if (isDeliveryCompleted) return;
    setModalMode(mode);
    setCurrentOrderId(order.id);
    setUploadModalOpen(true);
  };

  const handleUpdateClick = (
    mode: "contract" | "documents" | "payment_slip",
  ) => {
    setModalMode(mode);
    setCurrentOrderId(order.id);
    setUpdateModalOpen(true);
  };

  const handlePreviewClick = (
    mode: "contract" | "documents" | "payment_slip",
  ) => {
    setModalMode(mode);
    setCurrentOrderId(order.id);
    setPreviewModalOpen(true);
  };

  return (
    <Card className="mt-4 sm:mt-6">
      <CardContent className="pt-4 sm:pt-6 px-4 sm:px-5">
        <h4 className="text-sm font-semibold mb-4">Order Progress</h4>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex + 1;
            const isDocumentsStep =
              step.key === OrderProgressStatus.DocumentationsCompleted;
            const isPaymentStep =
              step.key === OrderProgressStatus.PaymentCompleted;
            const hasPaymentSlip = order.documents?.some(
              (doc) => doc.type === "payment_slip",
            );
            const hasContract = order.documents?.some(
              (doc) => doc.type === "contract",
            );
            const hasDocuments = order.documents!.length > 0;

            const shouldShowPaymentUploadButton =
              isDocumentationsCompleted &&
              currentStepIndex ===
                steps.findIndex(
                  (s) => s.key === OrderProgressStatus.DocumentationsCompleted,
                ) &&
              step.key === OrderProgressStatus.PaymentCompleted;

            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isCurrent ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        isCompleted
                          ? "text-green-600"
                          : isCurrent
                            ? "text-yellow-600"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {step.key === OrderProgressStatus.ContractSigned &&
                        hasContract && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handlePreviewClick("contract")}
                          >
                            View Contract
                          </Button>
                        )}
                      {step.key === OrderProgressStatus.ContractSigned &&
                        isOrderPlaced &&
                        !hasContract &&
                        !isDeliveryCompleted && (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleUploadClick("contract")}
                          >
                            Upload Contract
                          </Button>
                        )}
                      {step.key === OrderProgressStatus.ContractSigned &&
                        isOrderPlaced &&
                        hasContract &&
                        !isDeliveryCompleted && (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleUpdateClick("contract")}
                          >
                            Update Contract
                          </Button>
                        )}
                      {isDocumentsStep &&
                        (isCompleted || isContainerArrivedToPort) &&
                        hasDocuments && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handlePreviewClick("documents")}
                          >
                            View Documents
                          </Button>
                        )}
                      {isPaymentStep && hasPaymentSlip && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handlePreviewClick("payment_slip")}
                        >
                          View Payment Slip
                        </Button>
                      )}
                      {shouldShowPaymentUploadButton && (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            if (hasPaymentSlip) {
                              handleUpdateClick("payment_slip");
                            }
                            handleUploadClick("payment_slip");
                          }}
                        >
                          {hasPaymentSlip
                            ? "Update Payment Slip"
                            : "Upload Payment Slip"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
