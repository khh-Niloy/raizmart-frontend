"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/app/redux/features/auth/auth.api";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";

interface AuthModalProps {
  children: React.ReactNode;
}

export default function AuthModal({ children }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const pathname = usePathname();

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  const router = useRouter();

  const [login] = useLoginMutation();
  const [userRegister] = useRegisterMutation();

  interface FormData {
    identifier?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
  }

  const { register, handleSubmit } = useForm<FormData>();
  const onSubmit = async (data: FormData) => {
    console.log(data);

    if (isSignUp) {
      // Basic validation for password confirmation
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      const identifier: string | undefined = data.identifier;
      const isEmail = !!identifier && /@/.test(identifier);
      
      // Validate required fields
      if (!data.name || !data.password || !data.confirmPassword || !identifier) {
        toast.error("Please fill in all required fields.");
        return;
      }
      
      try {
        const payload = isEmail
          ? {
              name: data.name as string,
              email: identifier as string,
              password: data.password as string,
              confirmPassword: data.confirmPassword as string,
            }
          : {
              name: data.name as string,
              phone: identifier as string,
              password: data.password as string,
              confirmPassword: data.confirmPassword as string,
            };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await userRegister(payload as any).unwrap();
        if (res.success === true) {
          toast.success("Account created successfully!");
          setIsOpen(false);
          setIsSignUp(false); // Reset to login mode
        }
      } catch (error) {
        console.log(error);
        const errorData = error as { data?: { message?: string } };
        toast.error(
          errorData?.data?.message ||
            "Failed to create account. Please try again."
        );
      }
    } else {
      // Validate required fields for login
      if (!data.identifier || !data.password) {
        toast.error("Please fill in all required fields.");
        return;
      }
      
      try {
        const identifier: string | undefined = data.identifier;
        const isEmail = !!identifier && /@/.test(identifier);
        const payload = isEmail
          ? { email: identifier as string, password: data.password as string }
          : { phone: identifier as string, password: data.password as string };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await login(payload as any).unwrap();
        if (res.success === true) {
          toast.success("Login successful!");
          setIsOpen(false);
          router.push("/");
        }
        console.log(res);
      } catch (error) {
        console.log(error);
        const errorData = error as { data?: { message?: string } };
        toast.error(
          errorData?.data?.message ||
            "Login failed. Please check your credentials."
        );
      }
    }
  };

  // Listen for global "auth:open" event to open this modal programmatically
  // Use a global flag to prevent multiple modals from opening
  const modalInstanceIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Generate unique ID for this modal instance
    if (!modalInstanceIdRef.current) {
      modalInstanceIdRef.current = `auth-modal-${Date.now()}-${Math.random()}`;
    }

    const onOpen = () => {
      interface WindowWithAuthState extends Window {
        __authModalState?: { openInstanceId: string | null };
      }

      // Initialize global state if needed
      const windowWithState = window as WindowWithAuthState;
      if (!windowWithState.__authModalState) {
        windowWithState.__authModalState = { openInstanceId: null };
      }

      const state = windowWithState.__authModalState;

      // If another modal is already open, don't open this one
      if (
        state.openInstanceId &&
        state.openInstanceId !== modalInstanceIdRef.current
      ) {
        return;
      }

      // Set this instance as the open one and open the modal
      state.openInstanceId = modalInstanceIdRef.current;
      setIsOpen(true);
    };

    window.addEventListener("auth:open", onOpen);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth:open", onOpen);
      }
    };
  }, []);

  // Clear global flag when modal closes
  useEffect(() => {
    if (
      !isOpen &&
      typeof window !== "undefined" &&
      modalInstanceIdRef.current
    ) {
      interface WindowWithAuthState extends Window {
        __authModalState?: { openInstanceId: string | null };
      }
      const windowWithState = window as WindowWithAuthState;
      const state = windowWithState.__authModalState;
      if (state && state.openInstanceId === modalInstanceIdRef.current) {
        state.openInstanceId = null;
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <DialogTitle className="text-2xl mb-3 font-bold text-gray-900">
              {isSignUp ? "Create Account" : "Sign In"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Email or Phone Input */}
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">
                  Name
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom transition-all duration-200"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">
                Email or Phone Number
              </label>
              <input
                {...register("identifier")}
                type="text"
                placeholder="Enter email or phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom transition-all duration-200"
              />
            </div>

            {/* Password Input - Only show for Sign In */}
            {!isSignUp && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom transition-all duration-200"
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
            )}

            {/* Password & Confirm Password - Only show for Sign Up */}
            {isSignUp && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create Password"
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom transition-all duration-200"
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
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom focus:border-custom transition-all duration-200"
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
              </>
            )}

            {/* Forget Password Link - Only show for Sign In */}
            {!isSignUp && (
              <div className="flex justify-end mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm underline font-bold hover:text-custom/80 transition-colors duration-200 cursor-pointer"
                >
                  Forget Password?
                </Link>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              className={`mt-4 py-3 w-full bg-custom text-white rounded-lg font-semibold hover:bg-custom/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
            >
              {isSignUp ? "Get Started" : "Sign In"}
            </button>
          </form>

          {/* Terms and Conditions - Only show for Sign Up */}
          {isSignUp && (
            <div className="text-sm text-gray-600">
              <p>
                By creating an account, you agree to the RaizMart{" "}
                <Link
                  href="/privacy-policy"
                  className="text-custom hover:text-custom/80 font-semibold transition-colors duration-200 cursor-pointer"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms"
                  className="text-custom hover:text-custom/80 font-semibold transition-colors duration-200 cursor-pointer"
                >
                  Delivery Terms & Conditions
                </Link>
                .
              </p>
            </div>
          )}

          {/* Toggle Mode Link */}
          <div className="text-center">
            <span className="text-gray-600">
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
            </span>
            <button
              onClick={toggleMode}
              className="text-custom hover:text-custom/80 font-semibold transition-colors duration-200 cursor-pointer"
            >
              {isSignUp ? "Sign in" : "Create Account"}
            </button>
          </div>

          {/* Divider and Google Sign-In at bottom for Sign In only */}
          {!isSignUp && (
            <div className="mt-7">
              <div className="flex items-center">
                <div className="flex-grow h-px bg-gray-400 opacity-40" />
                <span className="mx-3 text-gray-400">Or continue with</span>
                <div className="flex-grow h-px bg-gray-400 opacity-40" />
              </div>
              <Link
                href={`http://localhost:5000/api/v1/auth/google?redirect=${pathname}`}
              >
                <button
                  type="button"
                  className="mt-5 w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                >
                  <span className="inline-block align-middle">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_1311_1322)">
                        <path
                          d="M19.8052 10.2309C19.8052 9.55052 19.7475 8.8677 19.6243 8.19824H10.2002V12.0491H15.6508C15.4108 13.2852 14.6813 14.3635 13.6371 15.0613V17.3197H16.7652C18.5752 15.6463 19.8052 13.221 19.8052 10.2309Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M10.2 20C12.6999 20 14.7872 19.1702 16.3763 17.7291L13.6371 15.0613C12.7896 15.6492 11.6652 16.0042 10.2 16.0042C7.78983 16.0042 5.75239 14.3092 5.01939 12.1294H1.16675V14.457C2.76846 17.7621 6.25317 20 10.2 20Z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.01933 12.1294C4.69167 11.1932 4.69167 10.2102 5.01933 9.27404V6.94641H1.16672C0.377723 8.41074 0.377723 10.9928 1.16672 12.4571L5.01933 12.1294Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M10.2 3.99588C11.7597 3.9714 13.2629 4.56326 14.3786 5.62977L16.4471 3.61779C14.7339 2.01788 12.5064 1.10486 10.2 1.12934C6.25317 1.12934 2.76846 3.36723 1.16675 6.94642L5.01936 9.27406C5.75239 7.09421 7.78983 5.39918 10.2 3.99588Z"
                          fill="#EA4335"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1311_1322">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  <span className="font-semibold text-gray-700 cursor-pointer">
                    Sign in with Google
                  </span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
