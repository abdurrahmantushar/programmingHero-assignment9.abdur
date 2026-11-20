
"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Heart,
  Settings,
  Pizza,
  Menu,
  X,
  LogOut,
  UserRound,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/customer", icon: LayoutDashboard },
  { name: "My Orders", href: "/customer/orders", icon: ShoppingBag },
  { name: "Order Tracking", href: "/customer/tracking", icon: MapPin },
  { name: "My Addresses", href: "/customer/addresses", icon: MapPin },
  { name: "My Favorites", href: "/customer/favorites", icon: Heart },
  { name: "Settings", href: "/customer/settings", icon: Settings },
];
function CustomerLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#292524]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-orange-100 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-orange-100 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e62e20] text-white">
              <Pizza size={23} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Pizza<span className="text-[#e62e20]">Hub</span>
            </span>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-orange-50 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <div className="border-b border-orange-100 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[#e62e20]">
              <UserRound size={25} />
            </div>
            <div>
              <p className="font-bold">Customer</p>
              <p className="text-xs text-gray-500">Customer Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            Customer Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/customer" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[#e62e20] text-white shadow-lg shadow-red-200"
                    : "text-gray-600 hover:bg-orange-50 hover:text-[#e62e20]"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-orange-100 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-orange-50 hover:text-[#e62e20]"
          >
            <LogOut size={19} />
            Back to Home
          </Link>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-orange-100 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-orange-50 lg:hidden"
            >
              <Menu size={23} />
            </button>
            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                Customer Dashboard
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Manage your orders and account
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="rounded-xl bg-[#e62e20] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c92318]"
          >
            Explore Menu
          </Link>
        </header>

        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <CustomerLayoutContent>{children}</CustomerLayoutContent>
    </Suspense>
  );
}
