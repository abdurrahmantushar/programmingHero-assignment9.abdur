
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Crown,
  Zap,
  ShieldCheck,
  Infinity,
  UtensilsCrossed,
  Star,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type SubscriptionData = {
  subscriptionPlan: "free" | "premium";
  subscriptionExpiresAt: string | null;
  totalMenuItems: number;
  menuLimit: number | null;
  remainingMenuItems: number | null;
  features: {
    unlimitedMenuItems: boolean;
    featuredHomepage: boolean;
    premiumBadge: boolean;
  };
};

export default function VendorSubscriptionPage() {
  const { data: session, isPending } = authClient.useSession();

  const [subscription, setSubscription] =
    useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/${session.user.id}/subscription`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load subscription details."
        );
      }

      setSubscription(result.data);
    } catch (error) {
      console.error("Subscription Fetch Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load subscription."
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isPending && session?.user?.id) {
      fetchSubscription();
    } else if (!isPending && !session?.user?.id) {
      setLoading(false);
    }
  }, [isPending, session?.user?.id, fetchSubscription]);

  const handleUpgrade = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in with your vendor account.");
      return;
    }

    try {
      setCheckoutLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/${session.user.id}/subscription/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to create checkout session."
        );
      }

      if (!result.data?.checkoutUrl) {
        throw new Error("Stripe checkout URL was not received.");
      }

      window.location.href = result.data.checkoutUrl;
    } catch (error) {
      console.error("Subscription Checkout Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
      setCheckoutLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#e62e20]" />
          <p className="text-sm font-medium text-gray-500">
            Loading subscription...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
        <h2 className="font-bold text-gray-900">Please sign in</h2>
        <p className="mt-2 text-sm text-gray-500">
          Sign in with your vendor account to manage your subscription.
        </p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
        <p className="font-semibold text-gray-800">
          Could not load subscription details.
        </p>
        <button
          onClick={fetchSubscription}
          className="mt-4 rounded-xl bg-[#e62e20] px-5 py-3 text-sm font-bold text-white hover:bg-[#c92318]"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isPremium = subscription.subscriptionPlan === "premium";
  const usagePercentage =
    subscription.menuLimit && subscription.menuLimit > 0
      ? Math.min(
          (subscription.totalMenuItems / subscription.menuLimit) * 100,
          100
        )
      : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Subscription Plans
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Choose the right plan to grow your restaurant with PizzaHub.
          </p>
        </div>

        <button
          onClick={fetchSubscription}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
        >
          <RefreshCw size={17} />
          Refresh Status
        </button>
      </div>

      <div
        className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8 ${
          isPremium
            ? "bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#c084fc]"
            : "bg-gradient-to-r from-[#e62e20] via-[#f04438] to-[#fb923c]"
        }`}
      >
        <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              {isPremium ? <Crown size={22} /> : <UtensilsCrossed size={22} />}
              <span className="text-sm font-bold uppercase tracking-wider text-white/80">
                Current Subscription
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              {isPremium ? "Premium Plan" : "Free Plan"}
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-white/85">
              {isPremium
                ? "Your restaurant has access to all Premium features. Keep growing with unlimited menu management."
                : "You are currently using the Free plan. Upgrade to unlock unlimited menu items and premium visibility."}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-bold">
              <ShieldCheck size={17} />
              {isPremium ? "Premium Member" : "Active Free Membership"}
            </div>
          </div>

          <div className="relative min-w-[170px] rounded-2xl border border-white/20 bg-white/15 p-5 backdrop-blur-sm">
            <p className="text-sm font-medium text-white/80">
              Menu Items Used
            </p>
            <p className="mt-2 text-4xl font-extrabold tabular-nums">
              {subscription.totalMenuItems}
              <span className="text-xl text-white/70">
                /{subscription.menuLimit ?? "∞"}
              </span>
            </p>
            <p className="mt-2 text-xs text-white/80">
              {isPremium
                ? "Unlimited menu capacity"
                : `${subscription.remainingMenuItems ?? 0} remaining slots`}
            </p>

            {!isPremium && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Choose Your Plan
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Upgrade your restaurant experience whenever you are ready.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div
            className={`relative rounded-3xl border bg-white p-6 shadow-sm sm:p-8 ${
              !isPremium
                ? "border-orange-300 ring-2 ring-orange-100"
                : "border-gray-200"
            }`}
          >
            {!isPremium && (
              <span className="absolute right-6 top-6 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#e62e20]">
                CURRENT PLAN
              </span>
            )}

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
              <UtensilsCrossed size={27} />
            </div>

            <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
              Free Plan
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Everything you need to get started.
            </p>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-4xl font-extrabold text-gray-900">
                ৳0
              </span>
              <span className="pb-1 text-sm text-gray-400">Free</span>
            </div>

            <div className="my-7 border-t border-gray-100" />

            <p className="mb-5 text-sm font-bold text-gray-800">
              What's included:
            </p>

            <ul className="space-y-4">
              {[
                "Up to 3 menu items",
                "Basic restaurant listing",
                "Standard menu management",
                "Receive customer orders",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <Check size={13} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled
              className={`mt-9 w-full rounded-xl border py-3.5 text-sm font-bold ${
                !isPremium
                  ? "border-orange-200 bg-orange-50 text-[#e62e20]"
                  : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
            >
              {!isPremium ? "Your Current Plan" : "Free Plan"}
            </button>
          </div>

          <div
            className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm sm:p-8 ${
              isPremium
                ? "border-purple-300 ring-2 ring-purple-100"
                : "border-purple-200"
            }`}
          >
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2 text-xs font-extrabold text-white">
              <Sparkles size={13} className="mr-1 inline" />
              PREMIUM
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Crown size={28} />
            </div>

            <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
              Premium Plan
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Unlock more opportunities for your restaurant.
            </p>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-4xl font-extrabold text-gray-900">
                Paid
              </span>
              <span className="pb-1 text-sm text-gray-400">
                One-time Stripe checkout
              </span>
            </div>

            <div className="my-7 border-t border-gray-100" />

            <p className="mb-5 text-sm font-bold text-gray-800">
              Everything in Free, plus:
            </p>

            <ul className="space-y-4">
              {[
                "Unlimited menu items",
                "Featured homepage placement",
                "Exclusive Premium badge",
                "Unlimited menu management",
                "More visibility for your restaurant",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                    <Check size={13} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <button
                disabled
                className="mt-9 w-full rounded-xl border border-purple-200 bg-purple-50 py-3.5 text-sm font-bold text-purple-700"
              >
                <Crown size={17} className="mr-2 inline" />
                You Have Premium
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="mt-9 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:from-purple-700 hover:to-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Upgrade to Premium
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Infinity size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Unlimited Items</p>
            <p className="mt-1 text-xs text-gray-500">
              Add as many menu items as you need.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#e62e20]">
            <Star size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Featured Listing</p>
            <p className="mt-1 text-xs text-gray-500">
              Get featured on the homepage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Premium Visibility</p>
            <p className="mt-1 text-xs text-gray-500">
              Stand out with a Premium badge.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
          <CreditCard size={22} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Secure Payment with Stripe
          </h3>
          <p className="mt-1 text-xs leading-5 text-gray-600">
            Your Premium upgrade is processed through Stripe Checkout.
            Your plan status will update after the payment is verified by the
            server.
          </p>
        </div>
      </div>
    </div>
  );
}
