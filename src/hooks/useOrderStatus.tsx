"use client"

import { useMemo } from "react"
import type {  OrderStatusData } from "@/types/order"

// Accept a real order object instead of a demo status string
export function useOrderStatus(order: any): OrderStatusData | null {
  return useMemo(() => {
    if (!order) return null;

    // Map real API fields to the expected structure
    const status = order.status || "none";
    if (status === "none") return null;

    // Steps mapping from real order fields
    const steps = [
      {
        name: "Order Placed",
        key: "orderPlaced",
        completed: !!order.created_at,
      },
      {
        name: "Contract Signed",
        key: "contractSigned",
        completed: !!order.contract_signed,
      },
      {
        name: "Processing Completed",
        key: "processingCompleted",
        completed: !!order.coffee_processing_completed,
      },
      {
        name: "Ready for Shipment",
        key: "readyForShipment",
        completed: !!order.coffee_ready_for_shipment,
      },
      {
        name: "Sample Approved",
        key: "sampleApproved",
        completed: !!order.pre_shipment_sample_approved,
      },
      {
        name: "Container Loaded",
        key: "containerLoaded",
        completed: !!order.container_loaded,
      },
      {
        name: "Shipped",
        key: "shipped",
        completed: !!order.container_on_board,
      },
      {
        name: "Delivered",
        key: "delivered",
        completed: order.status === "completed" || order.status === "delivered",
      },
    ];

    // Documents mapping (example, adjust as needed)
    const documents = order.documents || [];

    return {
      id: order.id,
      status: order.status,
      quantity: order.quantity_kg,
      totalPrice: order.total_amount,
      orderedDate: order.created_at,
      estimatedDelivery: order.estimated_delivery || null,
      steps,
      documents,
      needsReview: order.status === "delivered",
      hasIssue: order.status === "cancelled",
      issueDescription: order.cancelled_reason || null,
    };
  }, [order]);
}
