
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Package,
  Pizza,
  Search,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { authFetch } from "@/lib/auth-fetch";

type Order = {
  _id: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  deliveryDate: string;
  deliveryAddress: string;
  status: string;
  createdAt: string;
};

const filters = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const statusStyles: Record<string, string> = {
  pending: "bg-orange-50 text-orange-600",
  accepted: "bg-blue-50 text-blue-600",
  rejected: "bg-red-50 text-red-600",
  cancelled: "bg-gray-100 text-gray-600",
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function MyOrdersPage() {
  const { data: session, isPending } = authClient.useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch(
          `/api/customer/${session.user.id}/orders`
        , { credentials: "include" });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch orders");
        }

        setOrders(result.data || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session?.user?.id, isPending]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "all" || order.status === activeFilter;

      const matchesSearch =
        order.itemName.toLowerCase().includes(search.toLowerCase()) ||
        order._id.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, search]);

  const counts = {
    all: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    accepted: orders.filter((order) => order.status === "accepted").length,
    rejected: orders.filter((order) => order.status === "rejected").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
  };

  if (loading || isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#e62e20]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#e62e20]">
            CUSTOMER DASHBOARD
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View and manage all your pizza orders in one place.
          </p>
        </div>

        <Link
          href="/menu"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#c92318]"
        >
          <Pizza size={18} />
          Order More Pizza
        </Link>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            title: "Total Orders",
            value: counts.all,
            icon: ShoppingBag,
            color: "bg-blue-50 text-blue-600",
          },
          {
            title: "Pending",
            value: counts.pending,
            icon: Clock3,
            color: "bg-orange-50 text-orange-600",
          },
          {
            title: "Accepted",
            value: counts.accepted,
            icon: Package,
            color: "bg-purple-50 text-purple-600",
          },
          {
            title: "Rejected",
            value: counts.rejected,
            icon: XCircle,
            color: "bg-red-50 text-red-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon size={21} />
                </div>
                <span className="text-2xl font-extrabold text-gray-900">
                  {stat.value}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-600">
                {stat.title}
              </p>
            </div>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white">
        <div className="border-b border-orange-100 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Order History
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                You have {orders.length} orders in total.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pizza or order ID..."
                className="w-full rounded-xl border border-orange-100 bg-[#fffaf5] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e62e20]"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeFilter === filter.value
                    ? "bg-[#e62e20] text-white shadow-sm"
                    : "bg-orange-50 text-gray-600 hover:bg-orange-100"
                }`}
              >
                {filter.label}
                <span className="ml-2 opacity-75">
                  {counts[filter.value as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-orange-50">
          {filteredOrders.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <ShoppingBag
                size={45}
                className="mx-auto text-gray-300"
              />
              <h3 className="mt-4 text-lg font-bold text-gray-800">
                No orders found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or order filter.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveFilter("all");
                }}
                className="mt-5 text-sm font-bold text-[#e62e20] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <article
                key={order._id}
                className="p-5 transition hover:bg-orange-50/30 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-orange-50 sm:h-24 sm:w-24">
                      <Pizza size={38} className="text-[#e62e20]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-gray-900">
                          {order.itemName}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            statusStyles[order.status] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        Order #{order._id.slice(-8)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          Ordered: {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Package size={14} />
                          Quantity: {order.quantity}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          {order.deliveryAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-orange-50 pt-4 lg:border-0 lg:pt-0">
                    <div>
                      <p className="text-xs text-gray-400">Total Amount</p>
                      <p className="mt-1 text-xl font-extrabold text-gray-900">
                        ৳{order.totalPrice}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Delivery: {formatDate(order.deliveryDate)}
                      </p>
                    </div>

                    <Link
                      prefetch={false}
                      href={`/customer/orders/${order._id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2.5 text-sm font-bold text-[#e62e20] transition hover:bg-orange-50"
                    >
                      View Details
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {filteredOrders.length > 0 && (
          <div className="border-t border-orange-100 bg-[#fffaf5] px-5 py-4 text-center text-xs text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </section>
    </div>
  );
}
