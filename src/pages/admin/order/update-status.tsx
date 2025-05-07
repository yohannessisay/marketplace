"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Loader2, File, FileText, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Order } from "@/types/orders"

export function UpdateOrderStatusModal({ 
  order, 
  open, 
  onClose 
}: { 
  order: Order;
  open: boolean;
  onClose: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileError, setFileError] = useState("")
  const fileInputRef = useRef(null)

  // Order status options
  const statusOptions = [
    "contract_signed",
    "coffee_processing_completed",
    "coffee_ready_for_shipment",
    "pre_shipment_sample_approved",
    "pre_shipment_sample_ready",
    "container_loaded",
    "container_on_board",
  ]

  // Format status for display
  const formatStatus = (status: string): string => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get status badge color
  const getStatusColor = (status: string): string => {
    const statusMap = {
      contract_signed: "bg-blue-100 text-blue-800",
      coffee_processing_completed: "bg-purple-100 text-purple-800",
      coffee_ready_for_shipment: "bg-indigo-100 text-indigo-800",
      pre_shipment_sample_approved: "bg-green-100 text-green-800",
      pre_shipment_sample_ready: "bg-yellow-100 text-yellow-800",
      container_loaded: "bg-orange-100 text-orange-800",
      container_on_board: "bg-emerald-100 text-emerald-800",
    }
    return (statusMap as Record<string, string>)[status] || "bg-gray-100 text-gray-800"
  }

  // Handle file selection
  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0] || null
    setFileError("")

    if (!file) {
      setSelectedFile(null)
      return
    }

    // Check file type
    const fileType = file.type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"]

    if (!validTypes.includes(fileType)) {
      setFileError("Please upload only images (JPEG, PNG, GIF) or PDF files")
      e.target.value = ""
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB")
      e.target.value = null
      return
    }

    setSelectedFile(file)
  }

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).value = ""
    }
  }

  // Get file icon based on type
  const getFileIcon = (file:any) => {
    if (!file) return null

    if (file.type.startsWith("image/")) {
      return <File className="h-4 w-4" />
    } else {
      return <FileText className="h-4 w-4" />
    }
  }

  // Simulate API call to update order status
  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status && !selectedFile) {
      return
    }

    // Validate file is uploaded
    if (!selectedFile) {
      setFileError("Please upload a supporting document")
      return
    }

    setIsUpdating(true)
    setUpdateSuccess(false)
    setUpdateError(false)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append("orderId", order.id)
      formData.append("status", selectedStatus)
      formData.append("document", selectedFile)

      // Log the form data (in a real app, this would be sent to the server)
      console.log("FormData created with:", {
        orderId: order.id,
        status: selectedStatus,
        document: selectedFile ? (selectedFile as File).name : null,
      })

      // Simulate API call
      console.log(`PUT /api/orders/${order.id}`, formData)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate success
      setUpdateSuccess(true)

      // Close modal after success
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Failed to update order status:", error)
      setUpdateError(true)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Update Order Status</DialogTitle>
          <DialogDescription>Change the status for order {order.order_id}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Current Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Status</h3>
            <Badge className={cn("font-normal", getStatusColor(order.status))}>{formatStatus(order.status)}</Badge>
          </div>

          <Separator />

          {/* Order Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Order ID</p>
              <p className="font-medium">{order.order_id}</p>
            </div>
            <div>
              <p className="text-gray-500">Buyer</p>
              <p className="font-medium">{order.buyer_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium">{order.quantity_kg.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-gray-500">Total Amount</p>
              <p className="font-medium">${order.total_amount.toLocaleString()}</p>
            </div>
          </div>

          <Separator />

          {/* New Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">New Status</h3>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="document" className="text-sm font-medium text-gray-500">
              Supporting Document <span className="text-red-500">*</span>
            </Label>
            <div className="grid gap-2">
              <Input
                id="document"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,application/pdf"
                className={fileError ? "border-red-300" : ""}
              />
              {fileError && <p className="text-sm text-red-500">{fileError}</p>}

              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  {getFileIcon(selectedFile)}
                  <span className="text-sm truncate flex-1">{(selectedFile as File).name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-red-500"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Please upload supporting documentation for this status change. Accepted formats: JPEG, PNG, GIF, PDF.
                Max size: 5MB.
              </p>
            </div>
          </div>

          {/* Success message */}
          {updateSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                Order status has been updated successfully.
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {updateError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">
                There was a problem updating the order status. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={isUpdating || (selectedStatus === order.status && !selectedFile)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
