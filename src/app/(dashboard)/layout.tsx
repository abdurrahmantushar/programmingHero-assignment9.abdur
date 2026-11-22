
"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
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
  Utensils,
  PlusCircle,
  ClipboardList,
  CreditCard,
  Users,
  Package,
  Receipt,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "@/app/components/shared/ThemeToggle";

const dashboardMenus = {
  customer: {
    title: "Customer Dashboard",
    subtitle: "Manage your orders and account",
    menuTitle: "Customer Menu",
    menu: [
      { name: "Overview", href: "/customer", icon: LayoutDashboard },
      { name: "My Orders", href: "/customer/orders", icon: ShoppingBag },
      { name: "My Addresses", href: "/customer/addresses", icon: MapPin },
      { name: "My Favorites", href: "/customer/favorites", icon: Heart },
      { name: "Settings", href: "/customer/settings", icon: Settings },
    ],
  },

  vendor: {
    title: "Vendor Dashboard",
    subtitle: "Manage your restaurant and orders",
    menuTitle: "Vendor Menu",
    menu: [
      { name: "Overview", href: "/vendor", icon: LayoutDashboard },
      { name: "My Menu Items", href: "/vendor/menu", icon: Utensils },
      { name: "Add Menu Item", href: "/vendor/menu/add", icon: PlusCircle },
      { name: "Customer Orders", href: "/vendor/orders", icon: ClipboardList },
      { name: "Subscription", href: "/vendor/subscription", icon: CreditCard },
      { name: "Settings", href: "/vendor/settings", icon: Settings },
    ],
  },

  admin: {
    title: "Admin Dashboard",
    subtitle: "Manage your PizzaHub platform",
    menuTitle: "Admin Menu",
    menu: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard },
      { name: "Manage Users", href: "/admin/users", icon: Users },
      { name: "Manage Menu Items", href: "/admin/menu", icon: Package },
      { name: "Transactions", href: "/admin/transactions", icon: Receipt },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
};

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  const { data: session, isPending } = authClient.useSession();

  const role = session?.user?.role as keyof typeof dashboardMenus | undefined;
  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image;

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#fffaf5]">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-[#e62e20]" />
        </div>
        {children}
      </div>
    );
  }

  if (!role || !dashboardMenus[role]) {
    return (
      <div className="min-h-screen bg-[#fffaf5]">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="font-semibold text-gray-600">
            Unable to load dashboard.
          </p>
        </div>
        {children}
      </div>
    );
  }

  const config = dashboardMenus[role];

  const activeHref = [...config.menu]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) =>
        pathname === item.href ||
        (item.href !== `/${role}` && pathname.startsWith(`${item.href}/`))
    )?.href;

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
            {userImage && failedImage !== userImage ? (
              <Image
                src={userImage}
                alt={userName}
                width={48}
                height={48}
                unoptimized
                onError={() => setFailedImage(userImage)}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[#e62e20]">
                <UserRound size={25} />
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate font-bold">{userName}</p>
              <p className="text-xs capitalize text-gray-500">
                {role} Dashboard
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            {config.menuTitle}
          </p>

          {config.menu.map((item) => {
            const Icon = item.icon;
            const active = activeHref === item.href;

            return (
              <Link
                prefetch={false}
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
                {config.title}
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                {config.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
