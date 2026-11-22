
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Loader2,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Clock3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  Store,
  CalendarDays,
  X,
  ImageIcon,
} from "lucide-react";
import MenuItemImage from "@/app/components/shared/MenuItemImage";

type MenuStatus = "pending" | "approved" | "rejected";
type StatusFilter = "all" | MenuStatus;

interface MenuItem {
  _id: string;
  name?: string;
  itemName?: string;
  description?: string;
  price?: number;
  image?: string;
  images?: string[];
  category?: string;
  vendorId?: string;
  vendorName?: string;
  status: MenuStatus;
  createdAt?: string;
}

interface Pagination {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (status !== "all") params.set("status", status);

      const response = await fetch(
        `${API_URL}/api/admin/menu-items?${params.toString()}`,
        { credentials: "include", cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load menu items");
      }

      setMenuItems(result.data.menuItems || []);
      setPagination(
        result.data.pagination || {
          totalItems: 0,
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
    const timer = setTimeout(fetchMenuItems, 300);
    return () => clearTimeout(timer);
  }, [fetchMenuItems]);

  const updateStatus = async (
    item: MenuItem,
    newStatus: MenuStatus
  ) => {
    try {
      setActionLoading(item._id);

      const response = await fetch(
        `${API_URL}/api/admin/menu-items/${item._id}/status`,
        { credentials: "include",
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update status");
      }

      await fetchMenuItems();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setActionLoading(deleteItem._id);

      const response = await fetch(
        `${API_URL}/api/admin/menu-items/${deleteItem._id}`,
        { credentials: "include", method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete menu item");
      }

      setDeleteItem(null);

      if (menuItems.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchMenuItems();
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete menu item"
      );
    } finally {
      setActionLoading("");
    }
  };

  const getItemName = (item: MenuItem) =>
    item.name || item.itemName || "Untitled Item";

  const getItemImage = (item: MenuItem) =>
    item.image || item.images?.[0] || "";

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "N/A";
    return `৳${Number(price).toLocaleString("en-BD")}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusStyle = (itemStatus: MenuStatus) => {
    switch (itemStatus) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const statusTabs = [
    { value: "all", label: "All Items" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-600">
            Administration / Menu
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Menu Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review, approve and manage restaurant menu items.
          </p>
        </div>

        <button
          onClick={fetchMenuItems}
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
                Total Menu Items
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {pagination.totalItems.toLocaleString()}
              </h3>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UtensilsCrossed size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Current Page Items
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {menuItems.length}
              </h3>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Store size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                All Menu Items
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review and manage restaurant listings.
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
                placeholder="Search menu items..."
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
              onClick={fetchMenuItems}
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
                <th className="px-5 py-4 font-semibold">Menu Item</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold">Vendor</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Created</th>
                <th className="px-5 py-4 text-right font-semibold">
                  Actions
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
                      Loading menu items...
                    </p>
                  </td>
                </tr>
              ) : menuItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <UtensilsCrossed
                      size={35}
                      className="mx-auto text-gray-300"
                    />
                    <p className="mt-3 font-semibold text-gray-700">
                      No menu items found
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Try changing your search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                menuItems.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-emerald-50/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {getItemImage(item) ? (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                            <MenuItemImage
                              images={[getItemImage(item)]}
                              alt={getItemName(item)}
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                            <ImageIcon size={20} />
                          </div>
                        )}

                        <div className="max-w-[220px]">
                          <p className="truncate font-semibold text-gray-900">
                            {getItemName(item)}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                            {item.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium capitalize text-gray-600">
                        {item.category || "Uncategorized"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 font-semibold text-gray-800">
                        <DollarSign size={14} className="text-emerald-600" />
                        {formatPrice(item.price)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Store size={14} className="text-gray-400" />
                        <span className="max-w-[140px] truncate">
                          {item.vendorName || "Vendor"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(item.status)}`}
                      >
                        {item.status === "approved" ? (
                          <CheckCircle2 size={13} />
                        ) : item.status === "rejected" ? (
                          <XCircle size={13} />
                        ) : (
                          <Clock3 size={13} />
                        )}
                        {item.status || "pending"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                        <CalendarDays
                          size={14}
                          className="text-gray-400"
                        />
                        {formatDate(item.createdAt)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== "approved" && (
                          <button
                            onClick={() => updateStatus(item, "approved")}
                            disabled={actionLoading === item._id}
                            className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === item._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={15} />
                            )}
                          </button>
                        )}

                        {item.status !== "rejected" && (
                          <button
                            onClick={() => updateStatus(item, "rejected")}
                            disabled={actionLoading === item._id}
                            className="rounded-lg bg-amber-50 p-2 text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle size={15} />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteItem(item)}
                          disabled={actionLoading === item._id}
                          className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
              {pagination.totalItems === 0
                ? 0
                : (page - 1) * pagination.limit + 1}
              {" - "}
              {Math.min(page * pagination.limit, pagination.totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {pagination.totalItems}
            </span>{" "}
            items
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

      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-gray-900">
              Delete Menu Item?
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {getItemName(deleteItem)}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteItem(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={actionLoading === deleteItem._id}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === deleteItem._id
                  ? "Deleting..."
                  : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
