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
}

export function RequestEditModal({
  isOpen,
  onClose,
  entityId,
  entityType,
  onSubmitSuccess,
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
      await apiService().post(`/admin/request-edit-access`, {
        entity_id: entityId,
        entity_type: entityType,
        requested_fields: selectedFields,
        message,
      });
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Request Edit Access for{" "}
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Explain why you need to edit this ${entityType}...`}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Fields to Edit</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
