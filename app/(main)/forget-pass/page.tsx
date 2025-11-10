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
  const [lastOTPSentTime, setLastOTPSentTime] = useState<number | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [createOTP, { isLoading: isCreatingOTP }] =
    useForgetPasswordCreateOTPMutation();
  const [verifyOTP, { isLoading: isVerifyingOTP }] =
    useForgetPasswordVerifyOTPMutation();
  const [resetPassword, { isLoading: isResettingPassword }] =
    useResetPasswordMutation();


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
          setLastOTPSentTime(storedTimestamp);
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
      setLastOTPSentTime(now);
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
      setLastOTPSentTime(now);
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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === "email"
              ? "Forgot Password?"
              : step === "otp"
              ? "Verify Your Account"
              : "Reset Password"}
          </h1>
          <p className="text-gray-600">
            {step === "email"
              ? "Enter your email address and we'll send you a verification code to reset your password."
              : step === "otp"
              ? "Enter the 6-digit verification code that was sent to your email."
              : "Enter your new password below."}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom transition-all duration-200"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isCreatingOTP}
              className="w-full py-3 bg-custom text-white rounded-lg font-semibold hover:bg-custom/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingOTP ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-3">
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
                    className="w-14 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom transition-all duration-200 bg-gray-50"
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={isVerifyingOTP || otp.join("").length !== 6}
              className="w-full py-3 bg-custom text-white rounded-lg font-semibold hover:bg-custom/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifyingOTP ? "Verifying..." : "Verify Account"}
            </button>
            <div className="text-center">
              <span className="text-gray-600 text-sm">
                Didn&apos;t receive code?{" "}
              </span>
              {resendCooldown > 0 ? (
                <span className="text-gray-500 text-sm font-semibold">
                  Resend in {Math.floor(resendCooldown / 60)}:{(resendCooldown % 60).toString().padStart(2, "0")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isCreatingOTP}
                  className="text-custom hover:text-custom/80 font-semibold transition-colors duration-200 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-custom transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-custom transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isResettingPassword}
              className="w-full py-3 bg-custom text-white rounded-lg font-semibold hover:bg-custom/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResettingPassword ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

