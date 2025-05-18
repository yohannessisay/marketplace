"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
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
import { useNotification } from "@/hooks/useNotification";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { getFromLocalStorage, saveToLocalStorage } from "@/lib/utils";
import { APIErrorResponse } from "@/types/api";
import {
  OTP_TIMER_KEY,
  OTP_TIMER_RESETED_KEY,
  SIGNUP_PROFILE_KEY,
} from "@/types/constants";

type OTPValidationType = z.infer<typeof createOTPValidationSchema>;

export default function OTPInputPage() {
  const form = useForm<OTPValidationType>({
    resolver: zodResolver(createOTPValidationSchema),
    defaultValues: {
      otp: "",
    },
  });

  const [value, setLocalValue] = useState("");
  const [timer, setTimer] = useState(60);
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const navigate = useNavigate();
  const { successMessage, errorMessage } = useNotification();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const otpTimerReseted: any = getFromLocalStorage(
    OTP_TIMER_RESETED_KEY,
    "false",
  );

  // Function to start the timer with a given expiration time
  const startTimer = (expirationTime: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    localStorage.setItem(OTP_TIMER_KEY, expirationTime.toString());
    setTimer(Math.ceil((expirationTime - Date.now()) / 1000));

    intervalRef.current = setInterval(() => {
      const remainingTimeMs = expirationTime - Date.now();
      if (remainingTimeMs <= 0) {
        setTimer(0);
        localStorage.removeItem(OTP_TIMER_KEY);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        setTimer(Math.ceil(remainingTimeMs / 1000));
      }
    }, 1000);
  };

  // Initial timer setup
  useEffect(() => {
    const email = getFromLocalStorage(SIGNUP_PROFILE_KEY, null);
    if (!email) {
      navigate("/login");
      return;
    }

    if (otpTimerReseted === "true") {
      setTimer(0);
      localStorage.removeItem(OTP_TIMER_KEY);
    } else {
      const savedExpiration = localStorage.getItem(OTP_TIMER_KEY);
      let expirationTime: number;

      if (savedExpiration) {
        expirationTime = parseInt(savedExpiration, 10);
        const currentTime = Date.now();
        const remainingTimeMs = expirationTime - currentTime;

        if (remainingTimeMs > 0) {
          startTimer(expirationTime);
        } else {
          setTimer(0);
          localStorage.removeItem(OTP_TIMER_KEY);
        }
      } else {
        expirationTime = Date.now() + 60 * 1000;
        startTimer(expirationTime);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigate, otpTimerReseted]);

  const onSubmit = async (data: OTPValidationType) => {
    try {
      const email = getFromLocalStorage(SIGNUP_PROFILE_KEY, null);

      if (!email) {
        throw {
          error: {
            message: "No email found in user profile",
          },
        };
      }
      await apiService().postWithoutAuth("/auth/verify-email", {
        otp: data.otp,
        email,
      });

      saveToLocalStorage("current-step", "farm_profile");
      localStorage.removeItem(OTP_TIMER_KEY);
      localStorage.removeItem(SIGNUP_PROFILE_KEY);
      localStorage.removeItem(OTP_TIMER_RESETED_KEY);
      successMessage("OTP verified successfully!");
      navigate("/login");
    } catch (error: unknown) {
      const errorResponse = error as APIErrorResponse;
      console.log(error);
      if (
        errorResponse.error.details ===
        "This user's email has already been verified"
      ) {
        localStorage.removeItem(OTP_TIMER_KEY);
        localStorage.removeItem(OTP_TIMER_RESETED_KEY);
        successMessage("Email already verified!");
        navigate("/login");
      } else {
        errorMessage(errorResponse);
      }
    }
  };

  const requestNewOTP = async () => {
    if (isRequestingOTP || timer > 0) return;
    setIsRequestingOTP(true);

    try {
      const email = getFromLocalStorage(SIGNUP_PROFILE_KEY, null);

      if (!email) {
        throw {
          error: {
            message: "No email found in user profile",
          },
        };
      }
      await apiService().postWithoutAuth("/auth/resend-verification-email", {
        email,
      });

      successMessage("New OTP sent to your email!");
      const expirationTime = Date.now() + 60 * 1000;
      localStorage.setItem(OTP_TIMER_RESETED_KEY, "false");
      startTimer(expirationTime);
    } catch (error: unknown) {
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const handleOTPChange = (val: string) => {
    setLocalValue(val);
    form.setValue("otp", val);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center border rounded-md border-green-200 m-2 shadow-2xl"
        style={{
          backgroundImage: "url('images/otp.svg')",
        }}
      ></div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-8">
        <div className="w-full max-w-md shadow-lg rounded-lg p-6 bg-white border border-green-200">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            <span className="text-green-600">Afro</span>valley
          </h2>
          <p className="text-gray-600 mb-4 text-center">
            Enter the one-time password (OTP) sent to your email
          </p>
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
                    <FormLabel className="flex justify-center">
                      One-Time Password
                    </FormLabel>
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
                disabled={
                  form.formState.isSubmitting ||
                  form.getValues("otp").length < 6
                }
                className="w-full"
              >
                {form.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="text-center mt-4">
                <Button
                  type="button"
                  disabled={timer > 0 || isRequestingOTP}
                  onClick={requestNewOTP}
                  className="w-full hover:bg-primary bg-white text-black border border-green-400 hover:text-white"
                >
                  {timer > 0
                    ? `Request New OTP in ${timer}s`
                    : isRequestingOTP
                      ? "Requesting..."
                      : "Request New OTP"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
