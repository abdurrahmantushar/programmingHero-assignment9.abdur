
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Eye, EyeOff, Mail, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignUpForm() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState<"customer" | "vendor">("customer");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await authClient.signUp.email({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role,
            });

            if (error) {
                setError(error.message || "Unable to create account.");
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative w-full max-w-[550px] overflow-hidden rounded-3xl bg-cover bg-center p-5 shadow-2xl sm:p-8"
            style={{
                backgroundImage: "url('/images/categories/vegPizza.png')",
            }}
        >
            <div className="absolute inset-0 bg-black/35" />

            <div className="relative z-10 rounded-2xl p-6 sm:p-7">
                <div className="mb-7 text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <span className="text-3xl">🍕</span>
                        <span className="text-3xl font-extrabold text-white drop-shadow-md">
                            Pizza<span className="text-[#FF6B5F]">Hub</span>
                        </span>
                    </Link>

                    <h1 className="mt-6 text-3xl font-extrabold text-white drop-shadow-md">
                        Create Account
                    </h1>

                    <p className="mt-3 text-sm font-medium text-white/90">
                        Join PizzaHub and enjoy your favorite pizzas.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                            Full Name
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-white/50 bg-white/95 px-4 transition focus-within:border-[#E6392E] focus-within:ring-2 focus-within:ring-[#E6392E]/20">
                            <User size={19} className="text-[#77716B]" />

                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Enter your full name"
                                className="h-12 w-full bg-transparent text-sm text-[#25211E] outline-none placeholder:text-[#99918A]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                            Email Address
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-white/50 bg-white/95 px-4 transition focus-within:border-[#E6392E] focus-within:ring-2 focus-within:ring-[#E6392E]/20">
                            <Mail size={19} className="text-[#77716B]" />

                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="Enter your email"
                                className="h-12 w-full bg-transparent text-sm text-[#25211E] outline-none placeholder:text-[#99918A]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-3 block text-sm font-semibold text-white">
                            Select Your Role
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("customer")}
                                className={`rounded-xl border p-4 text-center transition ${
                                    role === "customer"
                                        ? "border-[#E6392E] bg-[#E6392E] text-white shadow-lg"
                                        : "border-white/60 bg-white/95 text-[#25211E] hover:border-[#E6392E]"
                                }`}
                            >
                                <User className="mx-auto mb-2" size={24} />
                                <span className="text-sm font-bold">Customer</span>
                                <p className={`mt-1 text-xs ${
                                    role === "customer" ? "text-white/90" : "text-[#77716B]"
                                }`}>
                                    Order your favorite food
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole("vendor")}
                                className={`rounded-xl border p-4 text-center transition ${
                                    role === "vendor"
                                        ? "border-[#E6392E] bg-[#E6392E] text-white shadow-lg"
                                        : "border-white/60 bg-white/95 text-[#25211E] hover:border-[#E6392E]"
                                }`}
                            >
                                <Store className="mx-auto mb-2" size={24} />
                                <span className="text-sm font-bold">Vendor</span>
                                <p className={`mt-1 text-xs ${
                                    role === "vendor" ? "text-white/90" : "text-[#77716B]"
                                }`}>
                                    Manage your restaurant
                                </p>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                            Password
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-white/50 bg-white/95 px-4 transition focus-within:border-[#E6392E] focus-within:ring-2 focus-within:ring-[#E6392E]/20">
                            <Store size={19} className="text-[#77716B]" />

                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                placeholder="Create a password"
                                className="h-12 w-full bg-transparent text-sm text-[#25211E] outline-none placeholder:text-[#99918A]"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#77716B] transition hover:text-[#E6392E]"
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                            Confirm Password
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-white/50 bg-white/95 px-4 transition focus-within:border-[#E6392E] focus-within:ring-2 focus-within:ring-[#E6392E]/20">
                            <Store size={19} className="text-[#77716B]" />

                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                placeholder="Confirm your password"
                                className="h-12 w-full bg-transparent text-sm text-[#25211E] outline-none placeholder:text-[#99918A]"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="text-[#77716B] transition hover:text-[#E6392E]"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={19} />
                                ) : (
                                    <Eye size={19} />
                                )}
                            </button>
                        </div>
                    </div>

                    <label className="flex items-start gap-2 pt-1 text-sm font-medium text-white">
                        <input
                            type="checkbox"
                            required
                            className="mt-0.5 h-4 w-4 accent-[#E6392E]"
                        />
                        <span>
                            I agree to the{" "}
                            <Link
                                href="#"
                                className="font-semibold text-[#FFD2CC] hover:text-white hover:underline"
                            >
                                Terms & Conditions
                            </Link>
                        </span>
                    </label>

                    {error && (
                        <p className="rounded-lg bg-red-600/90 px-3 py-2 text-sm text-white">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#E6392E] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#C9251A] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="my-5 flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/50" />
                    <span className="text-xs font-semibold text-white">
                        OR SIGN UP WITH
                    </span>
                    <div className="h-px flex-1 bg-white/50" />
                </div>

                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/60 bg-white/95 py-3 text-sm font-semibold text-[#25211E] transition hover:bg-white"
                >
                    <span className="text-lg font-bold text-[#4285F4]">G</span>
                    Continue with Google
                </button>

                <p className="mt-6 text-center text-sm font-medium text-white">
                    Already have an account?{" "}
                    <Link
                        href="/sign-in"
                        className="font-bold text-[#FFD2CC] transition hover:text-white hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
