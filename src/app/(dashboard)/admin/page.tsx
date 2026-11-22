"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
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
  CalendarDays,
  Activity,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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

type ChartSlice = {
  name: string;
  value: number;
  color: string;
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
  `$${(Number(amount) || 0).toLocaleString("en-BD", {
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
  if (role === "admin") return "bg-amber-100 text-amber-700";
  if (role === "vendor") return "bg-purple-50 text-purple-700";
  return "bg-blue-100 text-blue-700";
};

function DistributionChart({
  title,
  description,
  data,
  total,
}: {
  title: string;
  description: string;
  data: ChartSlice[];
  total: number;
}) {
  const hasData = total > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-50/60 blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          </div>

          <span className="shrink-0 rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Overview
          </span>
        </div>

        {hasData ? (
          <div className="mt-5 grid grid-cols-1 items-center gap-5 sm:grid-cols-2">
            <div className="relative mx-auto h-[210px] w-full max-w-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value, name) => [
                      Number(value).toLocaleString(),
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #eee5db",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold tabular-nums text-gray-900">
                  {total.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">Total</span>
              </div>
            </div>

            <div className="space-y-4">
              {data.map((item) => {
                const percentage = (item.value / total) * 100;

                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-gray-600">
                          {item.name}
                        </span>
                      </div>

                      <span className="text-sm font-bold tabular-nums text-gray-900">
                        {item.value.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-right text-xs text-gray-400">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-5 flex h-[210px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
              <Users size={23} />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-500">
              No data available
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Statistics will appear when data is available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState("This Month");
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const prefersReducedMotion = useReducedMotion() ?? false;

  const pageFade: Variants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" },
    },
  };

  const stagger: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const cardItem: Variants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" },
    },
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch(
          "/api/admin/dashboard",
          { credentials: "include", cache: "no-store" }
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
      description: "All registered accounts",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Vendors",
      value: dashboardData.totalVendors.toLocaleString(),
      description: "Registered vendors",
      icon: Store,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Customers",
      value: dashboardData.totalCustomers.toLocaleString(),
      description: "Registered customers",
      icon: UserRound,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Menu Items",
      value: dashboardData.totalMenuItems.toLocaleString(),
      description: "All menu items",
      icon: UtensilsCrossed,
      color: "bg-orange-50 text-[#e62e20]",
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders.toLocaleString(),
      description: "All customer orders",
      icon: ShoppingBag,
      color: "bg-pink-50 text-pink-600",
    },
    {
      title: "Premium Revenue",
      value: formatCurrency(dashboardData.premiumRevenue),
      description: "Premium subscriptions only",
      icon: Wallet,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const userDistribution: ChartSlice[] = [
    {
      name: "Customers",
      value: dashboardData.totalCustomers,
      color: "#16A34A",
    },
    {
      name: "Vendors",
      value: dashboardData.totalVendors,
      color: "#8B5CF6",
    },
  ];

  const freeVendors = Math.max(
    0,
    dashboardData.totalVendors - dashboardData.premiumVendors
  );

  const subscriptionDistribution: ChartSlice[] = [
    {
      name: "Premium",
      value: dashboardData.premiumVendors,
      color: "#F59E0B",
    },
    {
      name: "Free",
      value: freeVendors,
      color: "#94A3B8",
    },
  ];

  const MotionLink = motion.create(Link);

  return (
    <motion.div
      className="mx-auto max-w-7xl space-y-7"
      variants={pageFade}
      initial="hidden"
      animate="show"
    >
      <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="absolute bottom-0 left-0 top-0 w-1 rounded-r-full bg-[#e62e20]" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#e62e20]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e62e20]" />
              Control Center
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm text-gray-500">
              Welcome back! Here&apos;s what&apos;s happening on PizzaHub today.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 shadow-sm sm:self-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#e62e20] shadow-sm">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Today
              </p>
              <p className="mt-1 text-sm font-bold text-gray-700">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Dashboard data unavailable</p>
            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              variants={cardItem}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:p-6"
            >
              <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-orange-50/60 opacity-70 transition duration-300 group-hover:scale-125" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    {stat.title}
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-tight tabular-nums text-gray-900">
                    {loading ? "..." : stat.value}
                  </p>
                </div>

                <div
                  className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${stat.color}`}
                >
                  <Icon size={23} />
                </div>
              </div>

              <div className="relative mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e62e20]" />
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div
          variants={pageFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#e62e20]">
                <Activity size={21} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Platform Overview
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  A quick overview of your platform activity.
                </p>
              </div>
            </div>

            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-600 outline-none transition focus:border-[#e62e20] focus:ring-2 focus:ring-orange-100"
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-orange-50/50">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Total Users
                </p>
                <Users size={16} className="text-blue-600" />
              </div>
              <p className="mt-3 text-xl font-extrabold tabular-nums text-gray-900">
                {loading ? "..." : dashboardData.totalUsers.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-orange-50/50">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Menu Items
                </p>
                <UtensilsCrossed size={16} className="text-[#e62e20]" />
              </div>
              <p className="mt-3 text-xl font-extrabold tabular-nums text-gray-900">
                {loading
                  ? "..."
                  : dashboardData.totalMenuItems.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-orange-50/50">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Orders
                </p>
                <ShoppingBag size={16} className="text-green-600" />
              </div>
              <p className="mt-3 text-xl font-extrabold tabular-nums text-gray-900">
                {loading ? "..." : dashboardData.totalOrders.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-orange-50/50">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Premium Vendors
                </p>
                <Crown size={16} className="text-amber-600" />
              </div>
              <p className="mt-3 text-xl font-extrabold tabular-nums text-gray-900">
                {loading
                  ? "..."
                  : dashboardData.premiumVendors.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <DistributionChart
              title="User Distribution"
              description="Customers and vendors across PizzaHub"
              data={userDistribution}
              total={dashboardData.totalCustomers + dashboardData.totalVendors}
            />

            <DistributionChart
              title="Vendor Subscriptions"
              description="Premium and free vendor accounts"
              data={subscriptionDistribution}
              total={dashboardData.totalVendors}
            />
          </div>
        </motion.div>

        <motion.div
          variants={pageFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#e62e20]">
                <ArrowUpRight size={21} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Quick Actions
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Manage your platform
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <MotionLink
              prefetch={false}
              href="/admin/users"
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users size={19} />
              </div>
              <span className="text-sm font-bold text-gray-700">
                Manage Users
              </span>
              <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-orange-50 group-hover:text-[#e62e20]">
                <ArrowRight size={16} />
              </span>
            </MotionLink>

            <MotionLink
              prefetch={false}
              href="/admin/menu"
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#e62e20]">
                <UtensilsCrossed size={19} />
              </div>
              <span className="text-sm font-bold text-gray-700">
                Review Menu Items
              </span>
              <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-orange-50 group-hover:text-[#e62e20]">
                <ArrowRight size={16} />
              </span>
            </MotionLink>

            <MotionLink
              prefetch={false}
              href="/admin/orders"
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <ShoppingBag size={19} />
              </div>
              <span className="text-sm font-bold text-gray-700">
                Manage Orders
              </span>
              <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-orange-50 group-hover:text-[#e62e20]">
                <ArrowRight size={16} />
              </span>
            </MotionLink>

            <MotionLink
              prefetch={false}
              href="/admin/transactions"
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Wallet size={19} />
              </div>
              <span className="text-sm font-bold text-gray-700">
                Transactions
              </span>
              <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-orange-50 group-hover:text-[#e62e20]">
                <ArrowRight size={16} />
              </span>
            </MotionLink>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.section
          variants={pageFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={19} />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900">Recent Users</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Recently registered accounts
                </p>
              </div>
            </div>

            <MotionLink
              prefetch={false}
              href="/admin/users"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-[#e62e20] transition hover:border-orange-200 hover:bg-orange-50"
            >
              View All <ArrowRight size={14} />
            </MotionLink>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-gray-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-[#e62e20]" />
                Loading users...
              </div>
            ) : dashboardData.recentUsers.length ? (
              dashboardData.recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold shadow-sm ${getUserColor(
                        user.role
                      )}`}
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
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        user.role === "admin"
                          ? "bg-amber-100 text-amber-700"
                          : user.role === "vendor"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {user.role || "User"}
                    </span>
                    <p className="mt-2 text-[10px] text-gray-400">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                  <Users size={22} />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-500">
                  No users found
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  New registrations will appear here.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          variants={pageFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ShoppingBag size={19} />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900">Recent Orders</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Latest customer orders
                </p>
              </div>
            </div>

            <MotionLink
              prefetch={false}
              href="/admin/orders"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-[#e62e20] transition hover:border-orange-200 hover:bg-orange-50"
            >
              View All <ArrowRight size={14} />
            </MotionLink>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-gray-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-[#e62e20]" />
                Loading orders...
              </div>
            ) : dashboardData.recentOrders.length ? (
              dashboardData.recentOrders.map((order) => {
                const normalizedStatus = (order.status || "pending").toLowerCase();

                return (
                  <div
                    key={order._id}
                    className="space-y-2 px-5 py-4 transition hover:bg-gray-50 sm:px-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-extrabold tracking-wide text-gray-800">
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

                      <span className="shrink-0 text-sm font-extrabold tabular-nums text-gray-900">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                  <ShoppingBag size={22} />
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-500">
                  No orders found
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  New customer orders will appear here.
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      <motion.div
        variants={pageFade}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative overflow-hidden rounded-3xl border border-amber-100 bg-orange-50 p-6 shadow-sm sm:p-8"
      >
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/60 blur-2xl" />
        <div className="absolute -bottom-16 left-24 h-40 w-40 rounded-full bg-amber-100/60 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm">
              <Crown size={25} />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Premium Subscription Management
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Monitor vendor premium plans and subscription revenue.
              </p>
            </div>
          </div>

          <MotionLink
            prefetch={false}
            href="/admin/transactions"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#e52b19]"
          >
            View Transactions <ArrowRight size={17} />
          </MotionLink>
        </div>
      </motion.div>
    </motion.div>
  );
}
