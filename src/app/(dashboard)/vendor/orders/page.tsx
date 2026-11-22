
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  Package,
  RefreshCw,
  Eye,
  UtensilsCrossed,
  MessageSquare,
  Filter,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";

type Order = {
  _id: string;
  itemId: string;
  itemName: string;
  image?: string;
  price: number;
  quantity: number;
  totalPrice: number;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerImage?: string;
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

export default function VendorOrdersPage() {
  const { data: session, isPending } = authClient.useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const pageFade: Variants = { hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }, show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" } } };
  const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.07, delayChildren: prefersReducedMotion ? 0 : 0.04 } } };
  const itemFade: Variants = { hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }, show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" } } };

  const fetchOrders = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      const response = await authFetch(
        `/api/vendor/${session.user.id}/orders`,
        { credentials: "include", cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load orders.");
      }

      setOrders(result.data || []);
    } catch (error) {
      console.error("Fetch Orders Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isPending && session?.user?.id) {
      fetchOrders();
    } else if (!isPending && !session?.user?.id) {
      setLoading(false);
    }
  }, [isPending, session?.user?.id, fetchOrders]);

  const updateOrderStatus = async (
    orderId: string,
    status: "accepted" | "rejected"
  ) => {
    if (!session?.user?.id) return;

    try {
      setUpdatingId(orderId);

      const response = await authFetch(
        `/api/vendor/${session.user.id}/orders/${orderId}`,
        { credentials: "include",
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update order.");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );

      setSelectedOrder((prev) =>
        prev?._id === orderId ? { ...prev, status } : prev
      );

      toast.success(
        status === "accepted"
          ? "Order accepted successfully!"
          : "Order rejected successfully!"
      );
    } catch (error) {
      console.error("Update Order Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      accepted: orders.filter((order) => order.status === "accepted").length,
      rejected: orders.filter((order) => order.status === "rejected").length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        order.itemName?.toLowerCase().includes(searchTerm) ||
        order.customerName?.toLowerCase().includes(searchTerm) ||
        order.customerEmail?.toLowerCase().includes(searchTerm);

      const matchesStatus =
        activeFilter === "all" || order.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, activeFilter]);

  const statusStyle = (status: Order["status"]) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-700 border-green-100";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#e62e20]" />
          <p className="text-sm font-medium text-gray-500">
            Loading customer orders...
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
          Sign in with your vendor account to view customer orders.
        </p>
      </div>
    );
  }

  return (
    <motion.div className="mx-auto max-w-7xl space-y-7" variants={pageFade} initial="hidden" animate="show">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Customer Orders
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage incoming orders and keep track of your restaurant sales.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
        >
          <RefreshCw size={17} />
          Refresh Orders
        </button>
      </div>

      <motion.div className="grid grid-cols-2 gap-4 lg:grid-cols-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.12 }}>
        <motion.div variants={itemFade} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#e62e20]">
              <ShoppingBag size={21} />
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500">Total Orders</p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
            {stats.total}
          </h2>
        </motion.div>

        <motion.div variants={itemFade} className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock3 size={21} />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500">Pending</p>
          <h2 className="mt-1 text-3xl font-extrabold text-amber-600">
            {stats.pending}
          </h2>
        </motion.div>

        <motion.div variants={itemFade} className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <CheckCircle2 size={21} />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500">Accepted</p>
          <h2 className="mt-1 text-3xl font-extrabold text-green-600">
            {stats.accepted}
          </h2>
        </motion.div>

        <motion.div variants={itemFade} className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <XCircle size={21} />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500">Rejected</p>
          <h2 className="mt-1 text-3xl font-extrabold text-red-600">
            {stats.rejected}
          </h2>
        </motion.div>
      </motion.div>

      <motion.div variants={itemFade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer or item name..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e62e20]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "All Orders", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Accepted", value: "accepted" },
              { label: "Rejected", value: "rejected" },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeFilter === filter.value
                    ? "bg-[#e62e20] text-white"
                    : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
          <Filter size={14} />
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </motion.div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#e62e20]">
            <ShoppingBag size={30} />
          </div>

          <h3 className="mt-5 text-lg font-bold text-gray-900">
            {orders.length === 0 ? "No Orders Yet" : "No Matching Orders"}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {orders.length === 0
              ? "When customers order your menu items, their orders will appear here."
              : "Try changing your search or selected status filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {order.image ? (
                      <img
                        src={order.image}
                        alt={order.itemName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <UtensilsCrossed size={27} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-gray-900">
                        {order.itemName}
                      </h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold capitalize ${statusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Package size={14} />
                        Qty: {order.quantity}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {order.deliveryDate
                          ? new Date(order.deliveryDate).toLocaleDateString()
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 lg:w-48">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Customer
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    {order.customerImage ? (
                      <img
                        src={order.customerImage}
                        alt={order.customerName || "Customer"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-[#e62e20]">
                        {(order.customerName || "C").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800">
                        {order.customerName || "Customer"}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {order.customerEmail || "Customer order"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 lg:w-52 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div>
                    <p className="text-xs text-gray-400">Total Amount</p>
                    <p className="mt-1 text-2xl font-extrabold text-[#e62e20]">
                      ৳{order.totalPrice}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#e62e20]"
                    title="View order details"
                  >
                    <Eye size={19} />
                  </button>
                </div>
              </div>

              {order.status === "pending" && (
                <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-xs font-medium text-gray-500">
                    This order is waiting for your response.
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={updatingId === order._id}
                      onClick={() => updateOrderStatus(order._id, "rejected")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:flex-none"
                    >
                      <XCircle size={17} />
                      Reject
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === order._id}
                      onClick={() => updateOrderStatus(order._id, "accepted")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#c92318] disabled:opacity-50 sm:flex-none"
                    >
                      {updatingId === order._id ? (
                        <RefreshCw size={17} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}
                      Accept Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-900">
                Order Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <XCircle size={21} />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-4">
              {selectedOrder.image ? (
                <img
                  src={selectedOrder.image}
                  alt={selectedOrder.itemName}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-orange-50 text-[#e62e20]">
                  <UtensilsCrossed size={28} />
                </div>
              )}

              <div>
                <h3 className="font-bold text-gray-900">
                  {selectedOrder.itemName}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {selectedOrder.quantity}
                </p>
                <p className="mt-1 text-sm font-bold text-[#e62e20]">
                  ৳{selectedOrder.totalPrice}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Customer
                </p>
                <p className="mt-1 font-bold text-gray-800">
                  {selectedOrder.customerName || "Customer"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.customerEmail || "Email not available"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-400">
                  <MapPin size={14} />
                  Delivery Address
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {selectedOrder.deliveryAddress}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-400">
                  <CalendarDays size={14} />
                  Delivery Date
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {selectedOrder.deliveryDate
                    ? new Date(selectedOrder.deliveryDate).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>

              {selectedOrder.message && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-400">
                    <MessageSquare size={14} />
                    Customer Message
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {selectedOrder.message}
                  </p>
                </div>
              )}
            </div>

            {selectedOrder.status === "pending" && (
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={updatingId === selectedOrder._id}
                  onClick={() =>
                    updateOrderStatus(selectedOrder._id, "rejected")
                  }
                  className="flex-1 rounded-xl border border-red-200 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>

                <button
                  type="button"
                  disabled={updatingId === selectedOrder._id}
                  onClick={() =>
                    updateOrderStatus(selectedOrder._id, "accepted")
                  }
                  className="flex-1 rounded-xl bg-[#e62e20] py-3 text-sm font-bold text-white hover:bg-[#c92318] disabled:opacity-50"
                >
                  Accept Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
