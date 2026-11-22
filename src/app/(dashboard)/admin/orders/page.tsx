
"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import {
  Search,
  RefreshCw,
  Loader2,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  XCircle,
  Truck,
  CalendarDays,
  MapPin,
  UserRound,
  Store,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Package,
  MessageSquare,
  DollarSign,
} from "lucide-react";

type OrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

type StatusFilter = "all" | OrderStatus;

interface Order {
  _id: string;
  itemId?: string;
  vendorId?: string;
  customerId?: string;
  itemName?: string;
  price?: number;
  quantity?: number;
  totalPrice?: number;
  deliveryDate?: string;
  deliveryAddress?: string;
  message?: string;
  status: OrderStatus;
  createdAt?: string;
  image?: string;
}

interface Pagination {
  totalOrders: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

const API_URL = "";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    totalOrders: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (status !== "all") params.set("status", status);

      const response = await authFetch(
        `${API_URL}/api/admin/orders?${params.toString()}`,
        { credentials: "include", cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load orders");
      }

      setOrders(result.data.orders || []);
      setPagination(
        result.data.pagination || {
          totalOrders: 0,
          currentPage: 1,
          totalPages: 1,
          limit: 10,
        }
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "৳0";
    return `৳${Number(price).toLocaleString("en-BD")}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (orderStatus: OrderStatus) => {
    switch (orderStatus) {
      case "accepted":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-100";
      case "cancelled":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const getStatusIcon = (orderStatus: OrderStatus) => {
    switch (orderStatus) {
      case "accepted":
        return <Truck size={13} />;
      case "completed":
        return <CheckCircle2 size={13} />;
      case "rejected":
        return <XCircle size={13} />;
      case "cancelled":
        return <XCircle size={13} />;
      default:
        return <Clock3 size={13} />;
    }
  };

  const statusTabs = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getOrderId = (id: string) => id.slice(-6).toUpperCase();

  return (
    <div className="min-h-screen space-y-6 bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-600">
            Administration / Orders
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Orders Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor and review all customer orders across PizzaHub.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Orders
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {pagination.totalOrders.toLocaleString()}
              </h3>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <ShoppingBag size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Current Page Orders
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {orders.length}
              </h3>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Package size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                All Orders
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View customer order details and delivery information.
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search item, customer or vendor ID..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatus(tab.value as StatusFilter);
                  setPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  status === tab.value
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="m-5 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4 font-semibold">Order</th>
                <th className="px-5 py-4 font-semibold">Customer ID</th>
                <th className="px-5 py-4 font-semibold">Vendor ID</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Delivery Date</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader2
                      size={28}
                      className="mx-auto animate-spin text-emerald-600"
                    />
                    <p className="mt-3 text-sm text-gray-500">
                      Loading orders...
                    </p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <ShoppingBag
                      size={35}
                      className="mx-auto text-gray-300"
                    />
                    <p className="mt-3 font-semibold text-gray-700">
                      No orders found
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Try changing your search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition hover:bg-emerald-50/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {order.image ? (
                          <img
                            src={order.image}
                            alt={order.itemName || "Order"}
                            className="h-11 w-11 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <ShoppingBag size={19} />
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.itemName || "Menu Item"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            #{getOrderId(order._id)}
                            {" · "}
                            Qty: {order.quantity || 1}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">
                        {order.customerId || "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">
                        {order.vendorId || "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                        <CalendarDays
                          size={14}
                          className="text-gray-400"
                        />
                        {formatDate(order.deliveryDate)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status || "pending"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {pagination.totalOrders === 0
                ? 0
                : (page - 1) * pagination.limit + 1}
              {" - "}
              {Math.min(page * pagination.limit, pagination.totalOrders)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {pagination.totalOrders}
            </span>{" "}
            orders
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="px-3 text-sm font-medium text-gray-700">
              Page {page} of {Math.max(1, pagination.totalPages)}
            </span>

            <button
              onClick={() =>
                setPage((prev) =>
                  Math.min(pagination.totalPages, prev + 1)
                )
              }
              disabled={page >= pagination.totalPages || loading}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Order Details
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Order #{getOrderId(selectedOrder._id)}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
              <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                {selectedOrder.image ? (
                  <img
                    src={selectedOrder.image}
                    alt={selectedOrder.itemName || "Order"}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Package size={24} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900">
                    {selectedOrder.itemName || "Menu Item"}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatPrice(selectedOrder.price)} ×{" "}
                    {selectedOrder.quantity || 1}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusStyle(selectedOrder.status)}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailBox
                  icon={<UserRound size={16} />}
                  label="Customer ID"
                  value={selectedOrder.customerId || "N/A"}
                />
                <DetailBox
                  icon={<Store size={16} />}
                  label="Vendor ID"
                  value={selectedOrder.vendorId || "N/A"}
                />
                <DetailBox
                  icon={<Package size={16} />}
                  label="Quantity"
                  value={String(selectedOrder.quantity || 1)}
                />
                <DetailBox
                  icon={<DollarSign size={16} />}
                  label="Unit Price"
                  value={formatPrice(selectedOrder.price)}
                />
                <DetailBox
                  icon={<CalendarDays size={16} />}
                  label="Created At"
                  value={formatDateTime(selectedOrder.createdAt)}
                />
                <DetailBox
                  icon={<CalendarDays size={16} />}
                  label="Delivery Date"
                  value={formatDate(selectedOrder.deliveryDate)}
                />
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <MapPin size={17} className="text-emerald-600" />
                  Delivery Address
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {selectedOrder.deliveryAddress || "No address provided"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <MessageSquare size={17} className="text-emerald-600" />
                  Customer Message
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {selectedOrder.message || "No message"}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                <span className="text-sm font-semibold text-gray-700">
                  Total Order Amount
                </span>
                <span className="text-xl font-bold text-emerald-700">
                  {formatPrice(selectedOrder.totalPrice)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 p-5">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-100 p-3">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 break-all text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}
