
"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = formData.email.trim();

    if (!email || !formData.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await authClient.signIn.email({
        email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }

      toast.success("Login successful!");

      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Google login failed.");
        setGoogleLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="relative w-full max-w-md overflow-hidden rounded-3xl bg-cover bg-center p-5 shadow-2xl sm:p-8"
      style={{
        backgroundImage: "url('/images/categories/vegPizza.png')",
      }}
    >
      <div className="relative z-10 rounded-2xl p-6 sm:p-7">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🍕</span>
            <span className="text-3xl font-extrabold text-[#25211E]">
              Pizza<span className="text-[#E6392E]">Hub</span>
            </span>
          </Link>

          <h1 className="mt-7 text-3xl font-extrabold text-[#25211E]">
            Welcome Back!
          </h1>

          <p className="mt-3 text-sm text-[#f7f3ef]">
            Sign in to continue your delicious journey.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Email Address
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-[#EEE5DB] bg-white px-4 transition focus-within:border-[#E6392E]">
              <Mail size={19} className="text-[#99918A]" />

              <input
                type="email"
                onChange={handleChange}
                id="email"
                name="email"
                value={formData.email}
                placeholder="Enter your email"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#AAA39C]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-[#EEE5DB] bg-white px-4 transition focus-within:border-[#E6392E]">
              <Lock size={19} className="text-[#99918A]" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                onChange={handleChange}
                id="password"
                name="password"
                value={formData.password}
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#AAA39C]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#99918A] transition hover:text-[#E6392E]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#E6392E]"
              />
              Remember me
            </label>

            <Link
              href="#"
              className="font-semibold text-[#E6392E] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#E6392E] py-3.5 text-sm font-bold text-white transition hover:bg-[#C9251A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#EEE5DB]" />
          <span className="text-xs font-medium text-[#99918A]">
            OR CONTINUE WITH
          </span>
          <div className="h-px flex-1 bg-[#EEE5DB]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#EEE5DB] bg-white py-3 text-sm font-semibold text-[#25211E] transition hover:bg-[#FFF8F0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-lg font-bold text-[#4285F4]">G</span>
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <p className="mt-7 text-center text-sm text-[#77716B]">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-bold text-[#E6392E] hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
