
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Crown,
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { authFetch } from "@/lib/auth-fetch";

type VerificationStatus = "loading" | "pending" | "success" | "error";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("Verifying your payment with Stripe...");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.id) {
      setStatus("error");
      setMessage("Please sign in with the vendor account used for this purchase.");
      return;
    }

    if (!sessionId || !sessionId.startsWith("cs_")) {
      setStatus("error");
      setMessage("Invalid Stripe checkout session.");
      return;
    }

    let cancelled = false;

const verifyPayment = async () => {
  try {
    setStatus("loading");
    setMessage("Verifying your payment with Stripe...");

    const response = await authFetch(
      `/api/vendor/${session.user.id}/subscription/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Payment verification failed."
      );
    }

    if (!cancelled) {
      if (result.data?.premiumActivated) {
        setStatus("success");
        setMessage("Your Premium subscription has been activated successfully.");
      } else {
        setStatus("pending");
        setMessage(
          result.data?.paymentVerified
            ? "Stripe payment confirmed. Premium activation is being finalized. Refresh this page shortly to check your status."
            : "Payment confirmation is being finalized. Refresh this page shortly to check your status."
        );
      }
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);

    if (!cancelled) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify your payment."
      );
    }
  }
};

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [isPending, session?.user?.id, sessionId]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f8f5] px-4 py-12">
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-green-100/60 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-100/60 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
        <div
          className={`px-6 py-12 text-center text-white sm:px-10 ${
            status === "success"
              ? "bg-gradient-to-br from-green-600 via-green-500 to-emerald-400"
              : status === "error"
                ? "bg-gradient-to-br from-red-600 via-red-500 to-orange-400"
                : "bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400"
          }`}
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/15">
            {status === "loading" || status === "pending" ? (
              <RefreshCw size={48} className="animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 size={55} />
            ) : (
              <XCircle size={55} />
            )}
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            {status === "loading"
              ? "Payment Verification"
              : status === "pending"
                ? "Activation Pending"
                : status === "success"
                  ? "Payment Verified"
                  : "Verification Failed"}
          </div>

          <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">
            {status === "loading"
              ? "Verifying Payment..."
              : status === "pending"
                ? "Finalizing Premium..."
                : status === "success"
                  ? "Payment Successful!"
                  : "Payment Verification Failed"}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/90">
            {message}
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  status === "success"
                    ? "bg-green-100 text-green-600"
                    : status === "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-orange-100 text-orange-600"
                }`}
              >
                <Crown size={25} />
              </div>

              <div>
                <h2 className="font-extrabold text-gray-900">
                  PizzaHub Premium
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {status === "success"
                    ? "Your Premium plan is now active."
                    : status === "pending"
                      ? "Payment confirmed. Premium activation is being finalized."
                      : status === "loading"
                        ? "Checking your payment information."
                        : "Your Premium activation is not confirmed."}
                </p>
              </div>
            </div>

            {status === "success" && (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-green-50 p-4">
                <ShieldCheck size={19} className="shrink-0 text-green-600" />
                <p className="text-xs leading-5 text-green-800">
                  Stripe payment verified successfully. Your vendor account
                  now has access to Premium features.
                </p>
              </div>
            )}
          </div>

          <div className="mt-7 space-y-3">
            {status === "success" ? (
              <>
                <Link
                  href="/vendor/subscription"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#c92318]"
                >
                  View Subscription
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/vendor"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  <LayoutDashboard size={18} />
                  Go to Dashboard
                </Link>
              </>
            ) : status === "error" ? (
              <>
                <Link
                  href="/vendor/subscription"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#c92318]"
                >
                  Check Subscription
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/vendor"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  <LayoutDashboard size={18} />
                  Back to Dashboard
                </Link>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-400">
                <RefreshCw size={16} className="animate-spin" />
                {status === "pending"
                  ? "Waiting for Premium activation. Refresh shortly."
                  : "Please wait while we verify your payment."}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f8f5]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
