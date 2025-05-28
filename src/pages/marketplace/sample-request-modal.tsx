"use client";

import * as React from "react";
import { Coffee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface SampleRequestModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  coffeeName: string;
  farmName: string;
}

const sampleRequestSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  phone: z.string().min(1, "Phone number is required"),
  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(0.1, "Weight must be at least 0.1kg")
    .max(2, "Weight cannot exceed 2kg"),
  notes: z.string().optional(),
});

type SampleRequestFormData = z.infer<typeof sampleRequestSchema>;

export default function SampleRequestModal({
  open,
  onClose,
  listingId,
  coffeeName,
  farmName,
}: SampleRequestModalProps) {
  const { successMessage, errorMessage } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SampleRequestFormData>({
    resolver: zodResolver(sampleRequestSchema),
    defaultValues: {
      listingId: "",
      deliveryAddress: "",
      phone: "",
      weight: 0.5,
      notes: "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (open && user) {
      form.reset({
        listingId,
        deliveryAddress: user.address || "",
        phone: user.phone || "",
        weight: 0.5,
        notes: "",
      });
    } else if (open) {
      form.reset({
        listingId,
        deliveryAddress: "",
        phone: "",
        weight: 0.5,
        notes: "",
      });
    }
  }, [open, user, listingId, form]);

  const handleSubmit = async (data: SampleRequestFormData) => {
    try {
      await apiService().post("/marketplace/listings/request-sample", {
        listingId: data.listingId,
        delivery_address: data.deliveryAddress,
        phone: data.phone,
        weight: data.weight,
        note: data.notes,
      });

      successMessage("Your sample request has been sent to the seller.");
      onClose();
      navigate("/market-place");
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-scroll">
        <DialogHeader className="items-center">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-emerald-600" />
            <DialogTitle className="text-center">
              Request Coffee Sample
            </DialogTitle>
          </div>
          <DialogDescription className="text-center">
            Request a sample of {coffeeName} from {farmName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-3"
          >
            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="required">Delivery Address</FormLabel>
                  <FormControl>
                    <Textarea
                      id="deliveryAddress"
                      placeholder="Enter your full delivery address"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="required">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="required">Sample Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      id="weight"
                      type="number"
                      min="0.1"
                      max="2"
                      step="0.1"
                      placeholder="Enter desired sample weight, max is 2 kgs"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <p className="text-xs text-slate-500">
                    Standard sample size is 0.5kg
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      id="notes"
                      placeholder="Any specific requirements or questions for the seller"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="grid grid-cols-2 gap-3 mb-3 mt-10">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
