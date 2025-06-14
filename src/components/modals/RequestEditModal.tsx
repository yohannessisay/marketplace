"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { Loader2 } from "lucide-react";

export type AdminEditRequestStatusType =
  | "not_requested"
  | "requested"
  | "allowed"
  | "expired"
  | "rejected";

interface RequestEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: string;
  onSubmitSuccess: (status: AdminEditRequestStatusType) => void;
  xfmrId?: string | undefined;
}

export function RequestEditModal({
  isOpen,
  onClose,
  entityId,
  entityType,
  onSubmitSuccess,
  xfmrId,
}: RequestEditModalProps) {
  const [message, setMessage] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errorMessage, successMessage } = useNotification();

  const editableFields =
    entityType === "listing"
      ? [
          { id: "coffee_variety", label: "Coffee Variety" },
          { id: "bean_type", label: "Bean Type" },
          { id: "crop_year", label: "Crop Year" },
          { id: "is_organic", label: "Organic Status" },
          { id: "processing_method", label: "Processing Method" },
          { id: "moisture_percentage", label: "Moisture Percentage" },
          { id: "screen_size", label: "Screen Size" },
          { id: "drying_method", label: "Drying Method" },
          { id: "wet_mill", label: "Wet Mill" },
          { id: "cup_taste", label: "Cup Taste" },
          { id: "cup_aroma", label: "Cup Aroma" },
          { id: "grade", label: "Grade" },
          { id: "quantity_kg", label: "Quantity (kg)" },
          { id: "price_per_kg", label: "Price per kg" },
          { id: "readiness_date", label: "Readiness Date" },
          { id: "lot_length", label: "Lot Length" },
          { id: "delivery_type", label: "Delivery Type" },
          { id: "shipping_port", label: "Shipping Port" },
          { id: "photos", label: "Photos" },
          { id: "documents", label: "Documents" },
        ]
      : entityType === "farm"
        ? [
            { id: "farm_name", label: "Farm Name" },
            { id: "town_location", label: "Town Location" },
            { id: "region", label: "Region" },
            { id: "country", label: "Country" },
            { id: "total_size_hectares", label: "Total Size (Hectares)" },
            { id: "coffee_area_hectares", label: "Coffee Area (Hectares)" },
            { id: "longitude", label: "Longitude" },
            { id: "latitude", label: "Latitude" },
            { id: "altitude_meters", label: "Altitude (Meters)" },
            { id: "crop_type", label: "Crop Type" },
            { id: "crop_source", label: "Crop Source" },
            { id: "origin", label: "Origin" },
            { id: "capacity_kg", label: "Capacity (kg)" },
            { id: "tree_type", label: "Tree Type" },
            { id: "tree_variety", label: "Tree Variety" },
            { id: "soil_type", label: "Soil Type" },
            { id: "avg_annual_temp", label: "Average Annual Temperature" },
            { id: "annual_rainfall_mm", label: "Annual Rainfall (mm)" },
            { id: "polygon_coords", label: "Polygon Coordinates" },
            { id: "photos", label: "Photos" },
            { id: "documents", label: "KYC Documents" },
          ]
        : entityType === "bank"
          ? [
              { id: "account_holder_name", label: "Account Holder Name" },
              { id: "bank_name", label: "Bank Name" },
              { id: "account_number", label: "Account Number" },
              { id: "branch_name", label: "Branch Name" },
              { id: "swift_code", label: "SWIFT Code" },
              { id: "is_primary", label: "Primary Account Status" },
              { id: "kyc_documents", label: "KYC Documents" },
            ]
          : [];

  const handleSubmit = async () => {
    if (!message.trim()) {
      errorMessage({ error: { message: "Please provide a message" } });
      return;
    }
    if (selectedFields.length === 0) {
      errorMessage({
        error: { message: "Please select at least one field to edit" },
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService().post(
        `/admin/request-edit-access`,
        {
          entity_id: entityId,
          entity_type: entityType,
          requested_fields: selectedFields,
          message,
        },
        xfmrId ? xfmrId : "",
      );
      successMessage("Edit access request submitted successfully");
      onSubmitSuccess("requested");
      setMessage("");
      setSelectedFields([]);
      onClose();
    } catch (error) {
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] xs:max-h-[85vh] lg:max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Request Edit Access for{" "}
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center">
            KYC for this {entityType} is completed, you need to create an edit
            access request to proceed to edit{" "}
          </p>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="message" className="pb-2">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Explain why you need to edit this ${entityType}...`}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="pb-2">Fields to Edit</Label>
            <div className="mt-2 max-h-[40vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {editableFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={(checked) => {
                        setSelectedFields((prev) =>
                          checked
                            ? [...prev, field.id]
                            : prev.filter((id) => id !== field.id),
                        );
                      }}
                    />
                    <Label htmlFor={field.id}>{field.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-3 mb-3 mt-5">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
