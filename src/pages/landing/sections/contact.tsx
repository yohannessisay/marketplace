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
      <DialogContent className="sm:max-w-[500px] bg-white rounded-xl border border-amber-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            What can we help you with?
          </DialogTitle>
          <DialogDescription className="text-gray-600 pt-1">
            Fill out the form below and we’ll get back to you as soon as
            possible.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      className="border-amber-200 focus:border-amber-700 rounded-md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-amber-700" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe@example.com"
                        type="email"
                        className="border-amber-200 focus:border-amber-700 rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-amber-700" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(123) 456-7890"
                        className="border-amber-200 focus:border-amber-700 rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-amber-700" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user_type"
                render={({ field }) => (
                  <FormItem id="userType">
                    <FormLabel className="text-gray-900">User Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-amber-200 focus:border-amber-700 rounded-md">
                          <SelectValue placeholder="Select User Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-amber-200">
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-amber-700" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your country"
                        className="border-amber-200 focus:border-amber-700 rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-amber-700" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How can we help you?"
                      className="min-h-[120px] border-amber-200 focus:border-amber-700 rounded-md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-amber-700" />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-md bg-amber-700 hover:bg-white hover:text-amber-700 hover:border-amber-700 border text-white"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
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
