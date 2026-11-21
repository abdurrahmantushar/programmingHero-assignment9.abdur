
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  UtensilsCrossed,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  Pizza,
  CalendarDays,
  Package,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Order = {
  _id: string;
  itemName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  deliveryDate: string;
  status: string;
  createdAt: string;
  customerName?: string;
};

type DashboardData = {
  totalMenuItems: number;
  pendingMenuItems: number;
  approvedMenuItems: number;
  rejectedMenuItems: number;
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  rejectedOrders: number;
  recentOrders: Order[];
};

const statusStyles: Record<string, string> = {
  pending: "bg-orange-50 text-orange-600",
  accepted: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-600",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function VendorDashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.id) {
      setLoading(false);
      setError("Please sign in to view your dashboard.");
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/${session.user.id}/dashboard`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load dashboard"
          );
        }

        setDashboard(result.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [session?.user?.id, isPending]);

  const stats = [
    {
      title: "Total Menu Items",
      value: dashboard?.totalMenuItems ?? 0,
      description: "All your menu items",
      icon: UtensilsCrossed,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Menu Items",
      value: dashboard?.pendingMenuItems ?? 0,
      description: "Waiting for approval",
      icon: Clock3,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Total Orders",
      value: dashboard?.totalOrders ?? 0,
      description: "All customer orders",
      icon: ShoppingBag,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Pending Orders",
      value: dashboard?.pendingOrders ?? 0,
      description: "Waiting for confirmation",
      icon: Clock3,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Accepted Orders",
      value: dashboard?.acceptedOrders ?? 0,
      description: "Orders accepted by you",
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#e62e20]" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center">
          <XCircle className="mx-auto text-red-500" size={40} />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Unable to Load Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e62e20] to-[#f15b35] p-6 text-white shadow-lg sm:p-9">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-white/80">
            VENDOR DASHBOARD
          </p>

          <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
            Welcome back, {session?.user?.name || "Vendor"}!
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
            Manage your restaurant, organize your menu, and keep track
            of your customer orders with PizzaHub.
          </p>

          <Link
            href="/vendor/menu/add"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#e62e20] transition hover:bg-orange-50"
          >
            Add Menu Item
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <UtensilsCrossed
          size={190}
          className="absolute -right-8 -bottom-12 hidden rotate-12 text-white/15 sm:block"
        />
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-gray-900">
            Business Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here is a summary of your restaurant activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon size={23} />
                  </div>

                  <ArrowUpRight size={18} className="text-gray-300" />
                </div>

                <h3 className="mt-5 text-3xl font-extrabold text-gray-900">
                  {stat.value}
                </h3>

                <p className="mt-1 font-semibold text-gray-700">
                  {stat.title}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 p-5 sm:px-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Recent Customer Orders
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Your latest restaurant orders
              </p>
            </div>

            <Link
              href="/vendor/orders"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e62e20] hover:underline"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          {!dashboard?.recentOrders.length ? (
            <div className="p-10 text-center">
              <ShoppingBag className="mx-auto text-gray-300" size={40} />
              <p className="mt-3 font-semibold text-gray-700">
                No orders yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-orange-50">
              {dashboard.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#e62e20]">
                      <Pizza size={30} />
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        {order.itemName}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Order #{order._id.slice(-8)}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Customer: {order.customerName || "Customer"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Qty {order.quantity} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="sm:text-right">
                      <p className="font-extrabold text-gray-900">
                        ৳{order.totalPrice}
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          statusStyles[order.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <Link
                      href="/vendor/orders"
                      className="rounded-lg border border-orange-200 p-2 text-gray-500 transition hover:border-[#e62e20] hover:text-[#e62e20]"
                      aria-label="View customer orders"
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-orange-100 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-gray-900">
              Quick Actions
            </h2>

            <div className="mt-5 space-y-3">
              <Link
                href="/vendor/menu/add"
                className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 transition hover:bg-orange-100"
              >
                <PlusIcon />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    Add Menu Item
                  </p>
                  <p className="text-xs text-gray-500">
                    Add a new item to your menu
                  </p>
                </div>
                <ArrowRight size={17} className="text-gray-400" />
              </Link>

              <Link
                href="/vendor/menu"
                className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 transition hover:bg-orange-100"
              >
                <UtensilsCrossed className="text-[#e62e20]" size={22} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    My Menu Items
                  </p>
                  <p className="text-xs text-gray-500">
                    Manage your restaurant menu
                  </p>
                </div>
                <ArrowRight size={17} className="text-gray-400" />
              </Link>

              <Link
                href="/vendor/orders"
                className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 transition hover:bg-orange-100"
              >
                <ShoppingBag className="text-[#e62e20]" size={22} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    Customer Orders
                  </p>
                  <p className="text-xs text-gray-500">
                    Review and manage orders
                  </p>
                </div>
                <ArrowRight size={17} className="text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-5">
            <div className="flex items-center gap-2 text-[#e62e20]">
              <CalendarDays size={19} />
              <h3 className="font-bold">Grow Your Restaurant</h3>
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Keep your menu updated and manage customer orders to
              grow your business with PizzaHub.
            </p>

            <Link
              href="/vendor/subscription"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#e62e20] hover:underline"
            >
              View Subscription
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlusIcon() {
  return <Package className="text-[#e62e20]" size={22} />;
}
