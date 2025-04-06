import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { createOTPValidationSchema } from "@/types/validation/auth";


type OTPValidationType = z.infer<typeof createOTPValidationSchema>;

export default function OTPInputPage() {
  const form = useForm<OTPValidationType>({
    resolver: zodResolver(createOTPValidationSchema),
    defaultValues: {
      otp: "",
    },
  });

  const [value, setLocalValue] = useState("");

  const onSubmit = (data: OTPValidationType) => {
    console.log(data);
  };

  const handleOTPChange = (val: string) => {
    setLocalValue(val);
    form.setValue("otp", val);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center border rounded-md border-green-500 m-2 shadow-2xl" 
        style={{
          backgroundImage: "url('images/otp.svg')",
        }}
      ></div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-8">
        <div className="w-full max-w-md shadow-lg rounded-lg p-6 bg-white border border-green-500">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            <span className="text-green-600">Afro</span>valley
          </h2>
          <p className="text-gray-600 mb-4 text-center">Enter the one time password sent to you</p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6 flex justify-center flex-col"
            >
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col items-center"> 
                    <FormLabel className="flex justify-center ">One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP
                        value={field.value || value}
                        onChange={handleOTPChange}
                        pattern={REGEXP_ONLY_DIGITS}
                        maxLength={6}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting||form.getValues("otp").length < 6}
                className="w-full"
              >
                {form.formState.isSubmitting ? "Submitting..." : "Verify OTP"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
