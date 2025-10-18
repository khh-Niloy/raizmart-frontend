"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";

interface AuthModalProps {
  children: React.ReactNode;
}

export default function AuthModal({ children }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  const router = useRouter();

  const [login] = useLoginMutation();
  const [userRegister] = useRegisterMutation();

  const { register, handleSubmit } = useForm();
  const onSubmit = async (data: any) => {
    console.log(data);

    if (isSignUp) {
      //   const {data: registerData} = useRegisterMutation(data);
      //   if (register.isSuccess) {
      //     toast.success("Account created successfully");
      //     setIsOpen(false);
      //   }
    } else {
      try {
        const res = await login(data).unwrap();
        if (res.success === true) {
          toast.success("login successfull");
        }
        router.push("/");
        console.log(res);
      } catch (error) {
        console.log(error);
        toast.error((error as any).data.message);
      }
    }
  };

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
            {/* Email/Phone Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">
                Email
              </label>
              <input
                {...register("email")}
                type="text"
                placeholder="Enter email"
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

            {/* Forget Password Link - Only show for Sign In */}
            {!isSignUp && (
              <div className="flex justify-end mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm underline font-bold hover:text-custom/80 transition-colors duration-200"
                >
                  Forget Password?
                </Link>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              className={`mt-4 py-3 w-full bg-custom text-white rounded-lg font-semibold hover:bg-custom/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
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
                  className="text-custom hover:text-custom/80 font-semibold transition-colors duration-200"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms"
                  className="text-custom hover:text-custom/80 font-semibold transition-colors duration-200"
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
              className="text-custom hover:text-custom/80 font-semibold transition-colors duration-200"
            >
              {isSignUp ? "Sign in" : "Create Account"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
