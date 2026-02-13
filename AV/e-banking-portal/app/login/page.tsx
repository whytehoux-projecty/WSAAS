"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Globe,
  Award,
  Zap,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Linkedin as LinkedinIcon,
} from "lucide-react";
import { api } from "@/lib/api-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

type PortalStatus = "online" | "offline" | "maintenance" | "scheduled_downtime";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [portalStatus, setPortalStatus] = useState<PortalStatus>("online");
  const [formData, setFormData] = useState({
    accountNumber: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPortalStatus = async () => {
      try {
        const response = await api.auth.getPortalStatus();
        if (response?.data?.status) {
          setPortalStatus(response.data.status as PortalStatus);
        }
      } catch (error) {
        console.error("Failed to fetch portal status:", error);
        // If we can't reach the backend, we might want to default to offline or keep online depending on strategy
        // For now, let's keep the default "online" but log the error,
        // or set to offline if we want to be strict.
        // setPortalStatus("offline");
      }
    };

    fetchPortalStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Check if portal is online before attempting login
    if (portalStatus !== "online") {
      setErrors({
        general:
          portalStatus === "maintenance"
            ? "Portal is currently under maintenance. Please try again later."
            : portalStatus === "scheduled_downtime"
              ? "Portal is undergoing scheduled maintenance. Please check back soon."
              : "Portal is currently offline. Please try again later.",
      });
      setIsLoading(false);
      return;
    }

    // Validation
    const newErrors: Record<string, string> = {};

    const isAccountNumber = /^\d{10,12}$/.test(formData.accountNumber);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.accountNumber);

    if (!formData.accountNumber) {
      newErrors.accountNumber = "Username or account number is required";
    } else if (!isAccountNumber && !isEmail) {
      newErrors.accountNumber =
        "Please enter a valid account number or email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Determine if logging in with email or account number
      const isEmailInput = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.accountNumber,
      );

      const loginPayload = isEmailInput
        ? { email: formData.accountNumber, password: formData.password }
        : {
            accountNumber: formData.accountNumber,
            password: formData.password,
          };

      // Call the backend API for authentication
      await api.auth.login(loginPayload);

      // Redirect to Dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setErrors({
        general:
          err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-full relative flex overflow-hidden">
      {/* Full Screen Background */}
      <div className="absolute inset-0 z-0 bg-white">
        <Image
          src="/images/login-bg.jpg"
          alt="Aurum Vault Login"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Top Header - Centered Logo */}
      <header className="absolute top-0 left-0 w-full z-40 py-4 flex items-center justify-center bg-gradient-to-b from-[#F1F8F5]/95 to-[#F1F8F5]/75 backdrop-blur-md border-b border-[#1E4B35]/10 shadow-sm">
        <div className="relative h-16 w-64">
          <Image
            src="/images/jp_logo_final.png"
            alt="JP Heritage"
            fill
            className="object-contain"
            priority
          />
        </div>
      </header>

      {/* Content Container - Ensure full height */}
      <div className="container mx-auto px-6 relative z-10 flex h-full items-center justify-center pb-[120px]">
        {/* Login Form - Strictly Centered in the available space */}
        <div className="relative z-30">
          {/* Explicitly sized container: 320px x auto - Sharper edges (rounded-sm) */}
          <div className="w-[320px] h-auto bg-[#F1F8F5]/75 backdrop-blur-md shadow-2xl rounded-sm p-6 border border-[#1E4B35]/10 flex flex-col justify-center">
            {/* General Error Message */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-sm mb-4">
                <p className="text-xs text-red-600 font-medium flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Number */}
              <div className="space-y-1">
                <label
                  htmlFor="accountNumberInput"
                  className="block text-sm font-medium text-gray-700">
                  Username or account number
                </label>
                <div className="relative">
                  <input
                    id="accountNumberInput"
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 rounded-none border-b border-gray-400 bg-transparent text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:border-[#1E4B35] focus:border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {errors.accountNumber && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.accountNumber}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label
                  htmlFor="passwordInput"
                  className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="passwordInput"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full h-10 px-3 pr-12 rounded-none border-b border-gray-400 bg-transparent text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:border-[#1E4B35] focus:border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1E4B35] hover:text-[#143d2a] text-sm font-semibold transition-colors">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rememberMe: e.target.checked,
                        })
                      }
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-gray-400 checked:border-[#1E4B35] checked:bg-[#1E4B35] transition-all disabled:opacity-50"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">
                    Remember me
                  </span>
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-[#1E4B35] text-white text-base font-bold rounded-[3px] hover:bg-[#143d2a] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>

                <div className="flex flex-col gap-2 items-center">
                  <Link
                    href="#"
                    className="text-sm text-[#1E4B35] hover:underline font-medium flex items-center justify-center gap-1">
                    Forgot username/password? <span className="text-xs">›</span>
                  </Link>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_CORPORATE_URL}/signup`}
                    className="text-sm text-[#1E4B35] hover:underline font-medium flex items-center justify-center gap-1">
                    Not enrolled? Sign up now.{" "}
                    <span className="text-xs">›</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer isAbsolute />
    </main>
  );
}
