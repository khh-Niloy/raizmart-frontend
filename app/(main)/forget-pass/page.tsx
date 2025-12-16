"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useForgetPasswordCreateOTPMutation,
  useForgetPasswordVerifyOTPMutation,
  useResetPasswordMutation,
} from "@/app/redux/features/auth/auth.api";

type Step = "email" | "otp" | "password";

const STEP_CONTENT: Record<
  Step,
  { title: string; subtitle: string; helper: string }
> = {
  email: {
    title: "Forgot Password?",
    subtitle:
      "Enter your email address and we'll send you a verification code to reset your password.",
    helper: "We'll send a secure 6-digit OTP straight to your inbox.",
  },
  otp: {
    title: "Verify Your Account",
    subtitle:
      "Enter the 6-digit verification code that was sent to your email.",
    helper: "Enter the code within 2 minutes to keep your account protected.",
  },
  password: {
    title: "Reset Password",
    subtitle: "Enter your new password below.",
    helper: "Create a strong password that you haven't used before.",
  },
};

const STEP_ORDER: Step[] = ["email", "otp", "password"];

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // in seconds
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [createOTP, { isLoading: isCreatingOTP }] =
    useForgetPasswordCreateOTPMutation();
  const [verifyOTP, { isLoading: isVerifyingOTP }] =
    useForgetPasswordVerifyOTPMutation();
  const [resetPassword, { isLoading: isResettingPassword }] =
    useResetPasswordMutation();

  const currentStepCopy = STEP_CONTENT[step];
  const currentStepIndex = STEP_ORDER.indexOf(step);
  const progressSteps = STEP_ORDER.map((stepKey) => ({
    key: stepKey,
    title: STEP_CONTENT[stepKey].title,
    helper: STEP_CONTENT[stepKey].helper,
  }));


  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Check if 2 minutes have passed since last OTP was sent
  useEffect(() => {
    if (step === "otp") {
      // Check sessionStorage for last OTP sent time
      const storedTime = sessionStorage.getItem("lastOTPSentTime");
      if (storedTime) {
        const storedTimestamp = parseInt(storedTime, 10);
        const elapsed = Math.floor((Date.now() - storedTimestamp) / 1000);
        const remaining = 120 - elapsed; // 2 minutes = 120 seconds
        if (remaining > 0) {
          setResendCooldown(remaining);
        } else {
          sessionStorage.removeItem("lastOTPSentTime");
        }
      }
    }
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await createOTP({ email: emailInput }).unwrap();
      setEmail(emailInput);
      toast.success("OTP sent");
      const now = Date.now();
      sessionStorage.setItem("lastOTPSentTime", now.toString());
      setResendCooldown(120); // 2 minutes cooldown
      setStep("otp");
    } catch (error: unknown) {
      const errorData = error as { data?: { message?: string }; message?: string };
      const message =
        errorData?.data?.message ||
        errorData?.message ||
        "Failed to send OTP. Please try again.";
      toast.error(message);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValues = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedValues.forEach((val, i) => {
        if (index + i < 6) {
          newOtp[index + i] = val;
        }
      });
      setOtp(newOtp);
      // Focus on the last filled input or the last input
      const nextIndex = Math.min(index + pastedValues.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      await verifyOTP({ email, otp: otpString }).unwrap();
      toast.success("OTP verified successfully");
      setStep("password");
    } catch (error: unknown) {
      const errorData = error as { data?: { message?: string }; message?: string };
      const message =
        errorData?.data?.message ||
        errorData?.message ||
        "Invalid or expired OTP. Please try again.";
      toast.error(message);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword({ 
        email, 
        newPassword 
      }).unwrap();
      toast.success("Password reset successfully");
      setEmail("");
      sessionStorage.removeItem("lastOTPSentTime");
      router.push("/");
      // Open auth modal
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:open"));
        }
      }, 100);
    } catch (error: unknown) {
      const errorData = error as { data?: { message?: string }; message?: string };
      const message =
        errorData?.data?.message ||
        errorData?.message ||
        "Failed to reset password. Please try again.";
      toast.error(message);
    }
  };

  const handleResendOTP = async () => {
    // Check if cooldown is active
    if (resendCooldown > 0) {
      toast.error(`Please wait ${Math.ceil(resendCooldown / 60)} minute(s) before resending`);
      return;
    }

    if (!email) {
      toast.error("Email not found. Please start over.");
      return;
    }

    try {
      await createOTP({ email }).unwrap();
      toast.success("OTP resent successfully");
      setOtp(Array(6).fill(""));
      const now = Date.now();
      sessionStorage.setItem("lastOTPSentTime", now.toString());
      setResendCooldown(120); // 2 minutes cooldown
    } catch (error: unknown) {
      const errorData = error as { data?: { message?: string }; message?: string };
      const message =
        errorData?.data?.message ||
        errorData?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:gap-16 lg:px-12 lg:py-20">
        <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center lg:w-1/2 lg:items-start lg:text-left">
          <span className="rounded-full bg-custom/10 px-4 py-1 text-sm font-semibold tracking-wide text-custom">
            Step {currentStepIndex + 1} of {STEP_ORDER.length}
          </span>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Recover your account from any device
          </h2>
          <p className="text-base text-gray-600 sm:text-lg">
            Follow the guided flow to securely reset your Raizmart password. The experience adapts for laptops, tablets, and mobile screens so you can finish without friction.
          </p>
          <ul className="mt-4 flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center lg:flex-col lg:items-start lg:gap-5">
            {progressSteps.map((progressStep, index) => {
              const isCompleted = currentStepIndex > index;
              const isActive = currentStepIndex === index;
              const cardStyles = isActive
                ? "border-custom bg-white shadow-lg shadow-custom/10"
                : isCompleted
                ? "border-custom/40 bg-custom/10"
                : "border-gray-200 bg-white/80";
              const indicatorStyles = isCompleted
                ? "bg-custom text-white shadow-md shadow-custom/40"
                : isActive
                ? "border-2 border-custom text-custom"
                : "border border-gray-200 text-gray-400";

              return (
                <li
                  key={progressStep.key}
                  className={`flex flex-1 items-center gap-4 rounded-2xl border px-4 py-3 transition-all sm:min-w-[220px] lg:w-full ${cardStyles}`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold ${indicatorStyles}`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900 sm:text-base">
                      {progressStep.title}
                    </span>
                    <span className="text-xs text-gray-500 sm:text-sm">
                      {progressStep.helper}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="w-full max-w-xl lg:w-1/2">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/40 backdrop-blur-sm sm:p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {currentStepCopy.title}
              </h1>
              <p className="mt-3 text-sm text-gray-600 sm:text-base">
                {currentStepCopy.subtitle}
              </p>
            </div>

            {/* Email Step */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-custom focus:outline-none focus:ring-2 focus:ring-custom/60 sm:text-base"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingOTP}
                  className="w-full rounded-lg bg-custom py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-custom/90 hover:shadow-lg hover:shadow-custom/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  {isCreatingOTP ? "Sending..." : "Send OTP"}
                </button>
              </form>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpInputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="h-12 w-12 rounded-lg border border-gray-300 bg-gray-50 text-center text-lg font-semibold tracking-widest transition-all duration-200 focus:border-custom focus:outline-none focus:ring-2 focus:ring-custom/60 sm:h-14 sm:w-14 sm:text-xl"
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isVerifyingOTP || otp.join("").length !== 6}
                  className="w-full rounded-lg bg-custom py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-custom/90 hover:shadow-lg hover:shadow-custom/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  {isVerifyingOTP ? "Verifying..." : "Verify Account"}
                </button>
                <div className="text-center text-sm sm:text-base">
                  <span className="text-gray-600">
                    Didn&apos;t receive code?{" "}
                  </span>
                  {resendCooldown > 0 ? (
                    <span className="font-semibold text-gray-500">
                      Resend in {Math.floor(resendCooldown / 60)}:
                      {(resendCooldown % 60).toString().padStart(2, "0")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isCreatingOTP}
                      className="font-semibold text-custom transition-colors duration-200 hover:text-custom/80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCreatingOTP ? "Sending..." : "Resend"}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Password Reset Step */}
            {step === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm shadow-sm transition-all duration-200 focus:border-custom focus:outline-none focus:ring-2 focus:ring-custom/60 sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors duration-200 hover:text-custom"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm shadow-sm transition-all duration-200 focus:border-custom focus:outline-none focus:ring-2 focus:ring-custom/60 sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors duration-200 hover:text-custom"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="w-full rounded-lg bg-custom py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-custom/90 hover:shadow-lg hover:shadow-custom/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  {isResettingPassword ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

