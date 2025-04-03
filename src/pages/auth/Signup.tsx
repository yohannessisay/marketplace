import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { buyerSchema, sellerSchema } from "@/types/validation/auth";
import { Link, useNavigate } from "react-router-dom";

// Buyer schema

// Define types based on the schemas
type BuyerFormValues = z.infer<typeof buyerSchema>;
type SellerFormValues = z.infer<typeof sellerSchema>;

export default function SignupPage() {
  const [role, setRole] = useState<"buyer" | "seller">("seller");
  const navigate = useNavigate();
  const buyerForm = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      preferredCurrency: "",
    },
    mode: "onChange",
  });

  const sellerForm = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      companyName: "",
      productCategory: "",
    },
    mode: "onChange",
  });

  const onBuyerSubmit = (data: BuyerFormValues) => {
    console.log("Buyer form submitted:", data);
    navigate("/verification");
  };

  const onSellerSubmit = (data: SellerFormValues) => {
    console.log("Seller form submitted:", data);
    navigate("/verification");
  };

  const handleRoleChange = (newRole: "buyer" | "seller") => {
    if (newRole === "buyer" && role === "seller") {
      const { firstName, lastName, phone, email, password } =
        sellerForm.getValues();
      buyerForm.setValue("firstName", firstName);
      buyerForm.setValue("lastName", lastName);
      buyerForm.setValue("phone", phone);
      buyerForm.setValue("email", email);
      buyerForm.setValue("password", password);
    } else if (newRole === "seller" && role === "buyer") {
      const { firstName, lastName, phone, email, password } =
        buyerForm.getValues();
      sellerForm.setValue("firstName", firstName);
      sellerForm.setValue("lastName", lastName);
      sellerForm.setValue("phone", phone);
      sellerForm.setValue("email", email);
      sellerForm.setValue("password", password);
    }

    setRole(newRole);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Side - Image */}
      <div className="hidden md:flex w-1/2 h-screen">
        <img
          src="/placeholder.svg?height=800&width=600"
          alt="Ethiopian Coffee Farms"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white p-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              <span className="text-green-600">Afro</span>valley
            </h2>
          </div>

          {/* Role Selection */}
          <div className="flex mb-4 space-x-2">
            <Button
              type="button"
              variant={role === "buyer" ? "default" : "outline"}
              className={`flex-1 ${role === "buyer" ? "bg-gray-900" : ""}`}
              onClick={() => handleRoleChange("buyer")}
            >
              Sign up as Buyer
            </Button>
            <Button
              type="button"
              variant={role === "seller" ? "default" : "outline"}
              className={`flex-1 ${role === "seller" ? "bg-gray-900" : ""}`}
              onClick={() => handleRoleChange("seller")}
            >
              Sign up as Seller
            </Button>
          </div>

          {/* Buyer Form */}
          {role === "buyer" && (
            <Form {...buyerForm}>
              <form
                onSubmit={buyerForm.handleSubmit(onBuyerSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={buyerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="First name*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={buyerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Last name*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={buyerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Phone*" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Email*" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Password*"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="preferredCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="ETB">
                            ETB (Ethiopian Birr)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-6"
                >
                  Create account
                </Button>
              </form>
            </Form>
          )}

          {/* Seller Form */}
          {role === "seller" && (
            <Form {...sellerForm}>
              <form
                onSubmit={sellerForm.handleSubmit(onSellerSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={sellerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="First name*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={sellerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Last name*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={sellerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Phone*" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Email*" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Password*"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Company name*" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="productCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="coffee">Coffee</SelectItem>
                          <SelectItem value="spices">Spices</SelectItem>
                          <SelectItem value="textiles">Textiles</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-6 "
                >
                  Create account
                </Button>
              </form>
            </Form>
          )}

          {/* Sign-in Option */}
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
