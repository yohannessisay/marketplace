"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import { Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  user_type: z.string().min(1, "Please select user type"),
  country: z.string().min(1, "Please enter your country"),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof formSchema>;

interface ContactModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function ContactModal({ open, setOpen }: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { successMessage, errorMessage } = useNotification();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      user_type: "",
      country: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    try {
      const result: any = await apiService().postWithoutAuth(
        "/general/contact-us",
        data,
      );
      if (result && result.success) {
        successMessage("Message sent successfully");
        form.reset();
        setOpen(false);
      }
    } catch {
      errorMessage("Something went wrong please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg bg-white rounded-xl border border-green-200 text-green-700 p-4 sm:p-6 max-h-[80vh] sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
            What can we help you with?
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm sm:text-base pt-1">
            Fill out the form below and we'll get back to you as soon as
            possible.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 sm:space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 text-sm sm:text-base">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      className="border-greetext-green-200 focus:border-green-700 text-green-700 rounded-md text-sm sm:text-base py-2 sm:py-2.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-green-700 text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 text-sm sm:text-base">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="someone@company.com"
                        type="email"
                        className="border-greetext-green-200 focus:border-green-700 text-green-700 rounded-md text-sm sm:text-base py-2 sm:py-2.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-green-700 text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 text-sm sm:text-base">
                      Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+2519-83-66-4237"
                        className="border-greetext-green-200 focus:border-green-700 text-green-700 rounded-md text-sm sm:text-base py-2 sm:py-2.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-green-700 text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user_type"
                render={({ field }) => (
                  <FormItem id="userType" className="min-w-[200px] sm:w-full">
                    <FormLabel className="text-gray-900 text-sm sm:text-base cursor-pointer">
                      User Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-greetext-green-200 focus:border-green-700 text-green-700 rounded-md text-sm sm:text-base py-2 sm:py-2.5 cursor-pointer">
                          <SelectValue placeholder="Select User Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-greetext-green-200 min-w-[200px]">
                        <SelectItem value="seller" className="cursor-pointer">
                          Seller
                        </SelectItem>
                        <SelectItem value="buyer" className="cursor-pointer">
                          Buyer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-green-700 text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 text-sm sm:text-base">
                      Country
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your country"
                        className="border-greetext-green-200 focus:border-green-700 text-green-700 rounded-md text-sm sm:text-base py-2 sm:py-2.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-green-700 text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 text-sm sm:text-base">
                    Message
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How can we help you?"
                      className="min-h-[100px] sm:min-h-[120px] border-green-200 focus:border-green-700 rounded-md text-sm sm:text-base py-2 sm:py-2.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-green-700 text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-3 sm:pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full rounded-md px-4 py-2 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md border text-white px-4 py-2 sm:text-base"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    Shoot us a Message
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
