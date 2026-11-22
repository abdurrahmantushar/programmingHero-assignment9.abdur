
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  UtensilsCrossed,
  MapPin,
  Package,
  RefreshCw,
  ImageIcon,
  Filter,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import MenuItemImage from "@/app/components/shared/MenuItemImage";
import { toast } from "sonner";

type MenuItem = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  location: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  isAvailable: boolean;
  createdAt: string;
};

export default function VendorMenuPage() {
  const { data: session, isPending } = authClient.useSession();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/vendor/${session.user.id}/menu-items`,
        { credentials: "include", cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load menu items.");
      }

      setMenuItems(result.data || []);
    } catch (error) {
      console.error("Fetch Menu Items Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load menu items."
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isPending && session?.user?.id) {
      fetchMenuItems();
    } else if (!isPending && !session?.user?.id) {
      setLoading(false);
    }
  }, [isPending, session?.user?.id, fetchMenuItems]);

  const handleDelete = async (itemId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed || !session?.user?.id) return;

    try {
      setDeletingId(itemId);

      const response = await fetch(
        `/api/vendor/${session.user.id}/menu-items/${itemId}`,
        { credentials: "include", method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete menu item.");
      }

      setMenuItems((prev) =>
        prev.filter((item) => item._id !== itemId)
      );

      toast.success("Menu item deleted successfully.");
    } catch (error) {
      console.error("Delete Menu Item Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete menu item."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || item.category === category;

      const matchesStatus =
        status === "all" || item.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [menuItems, search, category, status]);

  const stats = {
    total: menuItems.length,
    approved: menuItems.filter((item) => item.status === "approved").length,
    pending: menuItems.filter((item) => item.status === "pending").length,
    rejected: menuItems.filter((item) => item.status === "rejected").length,
  };

  const statusStyle = (itemStatus: MenuItem["status"]) => {
    switch (itemStatus) {
      case "approved":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#e62e20]" />
          <p className="text-sm font-medium text-gray-500">
            Loading your menu items...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-gray-900">
          Please sign in
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Sign in with your vendor account to manage your menu.
        </p>
        <Link
          href="/sign-in"
          className="mt-5 inline-block rounded-xl bg-[#e62e20] px-6 py-3 text-sm font-bold text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            My Menu Items
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your restaurant menu and keep your items updated.
          </p>
        </div>

        <Link
          prefetch={false}
          href="/vendor/menu/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#c92318]"
        >
          <Plus size={19} />
          Add New Item
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Items</p>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            {stats.total}
          </h2>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Approved</p>
          <h2 className="mt-2 text-3xl font-extrabold text-green-600">
            {stats.approved}
          </h2>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <h2 className="mt-2 text-3xl font-extrabold text-amber-600">
            {stats.pending}
          </h2>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Rejected</p>
          <h2 className="mt-2 text-3xl font-extrabold text-red-600">
            {stats.rejected}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
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
              placeholder="Search menu items..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e62e20]"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 outline-none focus:border-[#e62e20]"
            >
              <option value="all">All Categories</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Special">Special</option>
              <option value="Dessert">Dessert</option>
              <option value="Drinks">Drinks</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 outline-none focus:border-[#e62e20]"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              type="button"
              onClick={fetchMenuItems}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
          <Filter size={14} />
          Showing {filteredItems.length} of {menuItems.length} menu items
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#e62e20]">
            <UtensilsCrossed size={30} />
          </div>

          <h3 className="mt-5 text-lg font-bold text-gray-900">
            {menuItems.length === 0
              ? "No Menu Items Yet"
              : "No Matching Items Found"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            {menuItems.length === 0
              ? "Start building your restaurant menu by adding your first delicious item."
              : "Try changing your search or filters to find your menu items."}
          </p>

          {menuItems.length === 0 && (
            <Link
              prefetch={false}
              href="/vendor/menu/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e62e20] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c92318]"
            >
              <Plus size={18} />
              Add Your First Item
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] bg-gray-50">
                {item.images?.[0] ? (
                  <MenuItemImage
                    images={item.images}
                    alt={item.itemName}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <ImageIcon size={42} />
                  </div>
                )}

                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyle(item.status)}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#e62e20]">
                      {item.category}
                    </p>
                    <h3 className="mt-1 truncate text-lg font-extrabold text-gray-900">
                      {item.itemName}
                    </h3>
                  </div>

                  <p className="shrink-0 text-lg font-extrabold text-[#e62e20]">
                    ৳{item.price}
                  </p>
                </div>

                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Package size={15} />
                    Qty: {item.quantity}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} />
                    {item.location}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-lg px-3 py-2 text-xs font-bold ${
                      item.isAvailable
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      prefetch={false}
                      href={`/vendor/menu/edit/${item._id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit menu item"
                    >
                      <Pencil size={16} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Delete menu item"
                    >
                      {deletingId === item._id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
