"use client"

import { useMemo } from "react"
import type { OrderStatus, OrderStatusData } from "@/types/order"

export function useOrderStatus(demoOrderStatus: OrderStatus): OrderStatusData | null {
  return useMemo(() => {
    if (demoOrderStatus === "none") {
      return null
    }

    // Base order data
    const baseOrder = {
      quantity: 500,
      totalPrice: 4375,
      orderedDate: "2024-04-01",
      estimatedDelivery: "2024-06-15",
    }

    // Steps configuration based on order status
    const getSteps = () => {
      const allSteps = [
        { name: "Order Placed", key: "orderPlaced" },
        { name: "Contract Signed", key: "contractSigned" },
        { name: "Processing Completed", key: "processingCompleted" },
        { name: "Ready for Shipment", key: "readyForShipment" },
        { name: "Sample Approved", key: "sampleApproved" },
        { name: "Container Loaded", key: "containerLoaded" },
        { name: "Shipped", key: "shipped" },
        { name: "Delivered", key: "delivered" },
      ]

      let completedSteps: string[] = []

      switch (demoOrderStatus) {
        case "pending":
          completedSteps = ["orderPlaced"]
          break
        case "confirmed":
          completedSteps = ["orderPlaced", "contractSigned"]
          break
        case "processing":
          completedSteps = ["orderPlaced", "contractSigned", "processingCompleted"]
          break
        case "shipping":
          completedSteps = [
            "orderPlaced",
            "contractSigned",
            "processingCompleted",
            "readyForShipment",
            "sampleApproved",
            "containerLoaded",
            "shipped",
          ]
          break
        case "delivered":
        case "completed":
          completedSteps = [
            "orderPlaced",
            "contractSigned",
            "processingCompleted",
            "readyForShipment",
            "sampleApproved",
            "containerLoaded",
            "shipped",
            "delivered",
          ]
          break
        default:
          completedSteps = []
      }

      return allSteps.map((step) => ({
        ...step,
        completed: completedSteps.includes(step.key),
      }))
    }

    const getDocuments = () => {
      if (["completed", "delivered", "shipping"].includes(demoOrderStatus)) {
        return [
          { name: "Bill of Lading", date: "2024-05-15" },
          { name: "Quality Certificate", date: "2024-05-10" },
          { name: "Export License", date: "2024-05-08" },
        ]
      }

      if (["confirmed", "processing"].includes(demoOrderStatus)) {
        return [{ name: "Purchase Agreement", date: "2024-04-03" }]
      }

      return []
    }

    return {
      id: "order-123", // Add a unique identifier
      status: demoOrderStatus,
      ...baseOrder,
      steps: getSteps(),
      documents: getDocuments(),
      needsReview: demoOrderStatus === "delivered",
      hasIssue: demoOrderStatus === "cancelled",
      issueDescription: demoOrderStatus === "cancelled" ? "Cancelled due to quality concerns" : null,
    }
  }, [demoOrderStatus])
}
