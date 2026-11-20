
import Link from "next/link";
import {
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ArrowRight,
  Pizza,
  MapPin,
  CalendarDays,
  Plus,
} from "lucide-react";

const stats = [
  {
    title: "Total Orders",
    value: "12",
    description: "All time orders",
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Pending Orders",
    value: "02",
    description: "Waiting for confirmation",
    icon: Clock3,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Accepted Orders",
    value: "03",
    description: "Being prepared",
    icon: Package,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Completed Orders",
    value: "07",
    description: "Successfully delivered",
    icon: CheckCircle2,
    color: "bg-green-50 text-green-600",
  },
];

const recentOrders = [
  {
    id: "PH-1001",
    name: "Margherita Pizza",
    image: "/images/pizzas/margherita.jpg",
    date: "Nov 20, 2026",
    quantity: 2,
    total: 598,
    status: "Pending",
  },
  {
    id: "PH-1002",
    name: "Farmhouse Delight",
    image: "/images/pizzas/farhmhouse-delight.png",
    date: "Nov 18, 2026",
    quantity: 1,
    total: 399,
    status: "Accepted",
  },
  {
    id: "PH-1003",
    name: "Spicy Italian",
    image: "/images/pizzas/spicy-italian.jpg",
    date: "Nov 15, 2026",
    quantity: 1,
    total: 349,
    status: "Completed",
  },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-orange-50 text-orange-600",
  Accepted: "bg-blue-50 text-blue-600",
  Completed: "bg-green-50 text-green-600",
  Rejected: "bg-red-50 text-red-600",
  Cancelled: "bg-gray-100 text-gray-600",
};

export default function CustomerDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e62e20] to-[#f15b35] p-6 text-white shadow-lg sm:p-9">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-white/80">
            CUSTOMER DASHBOARD
          </p>

          <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
            Welcome back, Food Lover!
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
            Track your orders, manage your addresses, and discover your next
            favorite pizza.
          </p>

          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#e62e20] transition hover:bg-orange-50"
          >
            Explore Menu
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <Pizza
          size={190}
          className="absolute -right-8 -bottom-12 hidden rotate-12 text-white/15 sm:block"
        />
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-gray-900">
            Order Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here is a summary of your order activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                Recent Orders
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Your latest pizza orders
              </p>
            </div>

            <Link
              href="/customer/orders"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#e62e20] hover:underline"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="divide-y divide-orange-50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-orange-50">
                    <img
                      src={order.image}
                      alt={order.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {order.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Order #{order.id}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {order.date} · Qty {order.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="sm:text-right">
                    <p className="font-extrabold text-gray-900">
                      ৳{order.total}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${statusStyles[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <Link
                    href="/customer/orders"
                    className="rounded-lg border border-orange-200 p-2 text-gray-500 transition hover:border-[#e62e20] hover:text-[#e62e20]"
                    aria-label="View orders"
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-orange-100 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-gray-900">
              Quick Actions
            </h2>

            <div className="mt-5 space-y-3">
              <Link
                href="/menu"
                className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 transition hover:bg-orange-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#e62e20]">
                  <Pizza size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    Browse Menu
                  </p>
                  <p className="text-xs text-gray-500">
                    Find your favorite pizza
                  </p>
                </div>
                <ArrowRight size={17} className="text-gray-400" />
              </Link>

              <Link
                href="/customer/addresses"
                className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 transition hover:bg-orange-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#e62e20]">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    Manage Addresses
                  </p>
                  <p className="text-xs text-gray-500">
                    Update delivery locations
                  </p>
                </div>
                <ArrowRight size={17} className="text-gray-400" />
              </Link>

              <Link
                href="/customer/orders"
                className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 transition hover:bg-orange-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#e62e20]">
                  <ShoppingBag size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    My Orders
                  </p>
                  <p className="text-xs text-gray-500">
                    Check your order history
                  </p>
                </div>
                <ArrowRight size={17} className="text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-5">
            <div className="flex items-center gap-2 text-[#e62e20]">
              <CalendarDays size={19} />
              <h3 className="font-bold">Need Something?</h3>
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Ready for another delicious pizza? Explore our menu and place
              your next order.
            </p>

            <Link
              href="/menu"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#e62e20] hover:underline"
            >
              Order Now
              <Plus size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
