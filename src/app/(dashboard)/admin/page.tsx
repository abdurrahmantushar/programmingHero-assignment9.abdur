"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  Store,
  UserRound,
  UtensilsCrossed,
  ShoppingBag,
  Wallet,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  XCircle,
  Crown,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

type DashboardUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  subscriptionPlan?: string;
  createdAt?: string;
};

type DashboardOrder = {
  _id: string;
  itemName?: string;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  customerId?: string;
};

type DashboardData = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalMenuItems: number;
  totalOrders: number;
  premiumVendors: number;
  premiumRevenue: number;
  recentUsers: DashboardUser[];
  recentOrders: DashboardOrder[];
};

const initialDashboardData: DashboardData = {
  totalUsers: 0,
  totalVendors: 0,
  totalCustomers: 0,
  totalMenuItems: 0,
  totalOrders: 0,
  premiumVendors: 0,
  premiumRevenue: 0,
  recentUsers: [],
  recentOrders: [],
};

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount?: number) =>
  `৳${(Number(amount) || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;

const getInitials = (name?: string) => {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getUserColor = (role?: string) => {
  if (role === "vendor") return "bg-orange-100 text-orange-700";
  return "bg-blue-100 text-blue-700";
};

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState("This Month");
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to load dashboard data");
        }

        setDashboardData({
          ...initialDashboardData,
          ...result.data,
          recentUsers: result.data?.recentUsers || [],
          recentOrders: result.data?.recentOrders || [],
        });
      } catch (fetchError) {
        console.error("Admin dashboard fetch error:", fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers.toLocaleString(),
      change: null,
      description: "All registered accounts",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Vendors",
      value: dashboardData.totalVendors.toLocaleString(),
      change: null,
      description: "Registered vendors",
      icon: Store,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Customers",
      value: dashboardData.totalCustomers.toLocaleString(),
      change: null,
      description: "Registered customers",
      icon: UserRound,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Menu Items",
      value: dashboardData.totalMenuItems.toLocaleString(),
      change: null,
      description: "All menu items",
      icon: UtensilsCrossed,
      color: "bg-orange-50 text-[#e62e20]",
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders.toLocaleString(),
      change: null,
      description: "All customer orders",
      icon: ShoppingBag,
      color: "bg-pink-50 text-pink-600",
    },
    {
      title: "Premium Revenue",
      value: formatCurrency(dashboardData.premiumRevenue),
      change: null,
      description: "Premium subscriptions only",
      icon: Wallet,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Welcome back! Here's what's happening on PizzaHub.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600">
          <CalendarDays size={17} />
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <h2 className="mt-3 text-2xl font-extrabold text-gray-900">
                    {loading ? "..." : stat.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon size={23} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400">
                  {stat.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Platform Overview
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                A quick overview of your platform activity.
              </p>
            </div>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 outline-none focus:border-[#e62e20]"
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="mt-2 text-xl font-extrabold text-gray-900">
                {loading ? "..." : dashboardData.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Menu Items</p>
              <p className="mt-2 text-xl font-extrabold text-gray-900">
                {loading ? "..." : dashboardData.totalMenuItems.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Orders</p>
              <p className="mt-2 text-xl font-extrabold text-gray-900">
                {loading ? "..." : dashboardData.totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Premium Vendors</p>
              <p className="mt-2 text-xl font-extrabold text-gray-900">
                {loading ? "..." : dashboardData.premiumVendors.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-10 text-center">
            <TrendingUp size={30} className="mx-auto text-gray-400" />
            <p className="mt-3 text-sm font-semibold text-gray-600">
              Analytics Overview
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Revenue and platform activity charts can be added when historical
              analytics data is available.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Quick Actions
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Manage your platform
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#e62e20]">
              <ArrowUpRight size={21} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/50"
            >
              <div className="flex items-center gap-3">
                <Users size={19} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Manage Users
                </span>
              </div>
              <ArrowRight size={17} className="text-gray-400" />
            </Link>

            <Link
              href="/admin/menu"
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/50"
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed size={19} className="text-orange-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Review Menu Items
                </span>
              </div>
              <ArrowRight size={17} className="text-gray-400" />
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/50"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={19} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Manage Orders
                </span>
              </div>
              <ArrowRight size={17} className="text-gray-400" />
            </Link>

            <Link
              href="/admin/transactions"
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/50"
            >
              <div className="flex items-center gap-3">
                <Wallet size={19} className="text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Transactions
                </span>
              </div>
              <ArrowRight size={17} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:px-6">
            <div>
              <h2 className="font-extrabold text-gray-900">Recent Users</h2>
              <p className="mt-1 text-xs text-gray-500">
                Recently registered accounts
              </p>
            </div>

            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs font-bold text-[#e62e20] hover:underline"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">
                Loading users...
              </p>
            ) : dashboardData.recentUsers.length ? (
              dashboardData.recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${getUserColor(user.role)}`}
                    >
                      {getInitials(user.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800">
                        {user.name || "Unnamed User"}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {user.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        user.role === "vendor"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {user.role || "User"}
                    </span>
                    <p className="mt-2 text-[10px] text-gray-400">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-6 py-8 text-center text-sm text-gray-400">
                No users found.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:px-6">
            <div>
              <h2 className="font-extrabold text-gray-900">Recent Orders</h2>
              <p className="mt-1 text-xs text-gray-500">
                Latest customer orders
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-bold text-[#e62e20] hover:underline"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">
                Loading orders...
              </p>
            ) : dashboardData.recentOrders.length ? (
              dashboardData.recentOrders.map((order) => {
                const normalizedStatus = (order.status || "pending").toLowerCase();

                return (
                  <div key={order._id} className="space-y-2 px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-extrabold text-gray-800">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          normalizedStatus === "accepted"
                            ? "bg-green-50 text-green-600"
                            : normalizedStatus === "rejected"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {normalizedStatus === "accepted" ? (
                          <CheckCircle2 size={12} />
                        ) : normalizedStatus === "rejected" ? (
                          <XCircle size={12} />
                        ) : (
                          <Clock3 size={12} />
                        )}
                        {normalizedStatus.charAt(0).toUpperCase() +
                          normalizedStatus.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-700">
                          {order.itemName || "Menu item"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Customer · {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-extrabold text-gray-900">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="px-6 py-8 text-center text-sm text-gray-400">
                No orders found.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm">
            <Crown size={25} />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900">
              Premium Subscription Management
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Monitor vendor premium plans and subscription revenue.
            </p>
          </div>
        </div>

        <Link
          href="/admin/transactions"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c92318]"
        >
          View Transactions <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}
