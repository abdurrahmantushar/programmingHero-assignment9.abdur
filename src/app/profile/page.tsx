"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    UserRound,
    ShoppingBag,
    MapPin,
    Heart,
    Settings,
    LogOut,
    Pencil,
    Mail,
    Phone,
    CalendarDays,
    ChevronRight,
    Pizza,
    CreditCard,
    ShieldCheck,
    Plus,
    Camera,
    Star,
    type LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

const menuItems = [
  { label: "My Profile", icon: UserRound, active: true },
];

const orders = [
  {
    id: "#PH-10245",
    name: "Chicken BBQ Pizza",
    date: "Nov 18, 2026",
    price: "৳650",
    status: "Delivered",
    color: "bg-green-100 text-green-700",
  },
  {
    id: "#PH-10231",
    name: "Farmhouse Delight",
    date: "Nov 15, 2026",
    price: "৳550",
    status: "Delivered",
    color: "bg-green-100 text-green-700",
  },
  {
    id: "#PH-10198",
    name: "Spicy Italian Pizza",
    date: "Nov 10, 2026",
    price: "৳600",
    status: "Delivered",
    color: "bg-green-100 text-green-700",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [loggingOut, setLoggingOut] = useState(false);

  const name = user?.name?.trim() || "Pizza Lover";
  const email = user?.email || "Not available";
  const firstName = name.split(" ")[0];
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "PL";
  const role = user?.role ?? "customer";
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not available";
  const accountStatus = user?.emailVerified
    ? "Verified Account"
    : "Email Not Verified";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Unable to logout.");
        return;
      }

      toast.success("Logged out successfully");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Unable to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf3]">
        <p className="text-sm font-semibold text-gray-500">Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf3] px-5">
        <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-[#e52b19]">
            <UserRound size={28} />
          </div>
          <h1 className="mt-5 text-xl font-extrabold text-gray-900">
            Sign in to view your profile
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Access your orders, addresses and account details.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex rounded-lg bg-[#e52b19] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] pb-16">
      {/* Page Header */}
      <section className="border-b border-orange-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7">
          <p className="mb-2 text-sm font-semibold text-[#e52b19]">
            HOME / MY ACCOUNT
          </p>
          <h1 className="text-3xl font-extrabold text-[#222]">My Profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your account, orders and personal information.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-9 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center border-b border-gray-100 pb-6">
            <div className="relative">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={name}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 rounded-full border-4 border-orange-100 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-orange-100 bg-gradient-to-br from-[#ff9c43] to-[#e52b19] text-3xl font-bold text-white">
                  {initials}
                </div>
              )}
              <button
                type="button"
                aria-label="Change profile picture"
                className="absolute bottom-0 right-0 rounded-full bg-[#e52b19] p-2 text-white shadow-md transition hover:bg-red-700"
              >
                <Camera size={15} />
              </button>
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">{name}</h2>
            <p className="mt-1 text-sm text-gray-500">{email}</p>
            <span className="mt-3 rounded-full bg-orange-50 px-4 py-1 text-xs font-bold text-[#e52b19]">
              <Star size={12} className="mr-1 inline" />
              {role === "vendor" ? "Vendor Partner" : "Pizza Lover"}
            </span>
          </div>

          <nav className="mt-5 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href="#"
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    item.active
                      ? "bg-[#e52b19] text-white shadow-md shadow-red-200"
                      : "text-gray-600 hover:bg-orange-50 hover:text-[#e52b19]"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                  {item.active && (
                    <ChevronRight size={17} className="ml-auto" />
                  )}
                </a>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-5 flex w-full items-center gap-3 rounded-xl border-t border-gray-100 px-4 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut size={19} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </aside>

        {/* Main Content */}
        <div className="space-y-7">
          {/* Welcome Card */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e52b19] to-[#ff5b25] p-7 text-white shadow-lg shadow-red-100 sm:p-9">
            <div className="relative z-10 max-w-lg">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                WELCOME BACK!
              </span>
              <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                Hello, {firstName}! 👋
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/90">
                Your favorite pizzas are just a few clicks away.
                Check your orders and enjoy something delicious!
              </p>
            </div>
            <Pizza
              size={155}
              className="absolute -bottom-8 -right-5 rotate-12 text-white/15 sm:right-10"
            />
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {[
              { label: "Total Orders", value: "24", icon: ShoppingBag },
              { label: "Favorites", value: "12", icon: Heart },
              { label: "Reviews", value: "08", icon: Star },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#e52b19]">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold text-gray-900">
                    {stat.value}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </section>

          {/* Personal Information */}
          <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your personal account details.
                </p>
              </div>

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#e52b19] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                <Pencil size={15} />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <InfoItem icon={UserRound} label="Full Name" value={name} />
              <InfoItem icon={Mail} label="Email Address" value={email} />
              <InfoItem
                icon={Phone}
                label="Phone Number"
                value="Not provided"
              />
              <InfoItem
                icon={ShieldCheck}
                label="Account Role"
                value={role === "vendor" ? "Vendor" : "Customer"}
              />
              <InfoItem icon={CalendarDays} label="Member Since" value={joined} />
              <InfoItem
                icon={MapPin}
                label="Location"
                value="Not provided"
              />
              <InfoItem
                icon={ShieldCheck}
                label="Email Verification"
                value={accountStatus}
              />
            </div>
          </section>

          {/* Address */}
          <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Saved Addresses
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your delivery locations.
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-bold text-[#e52b19] hover:text-red-700"
              >
                <Plus size={18} />
                Add New
              </button>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-orange-200 bg-orange-50/50 p-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#e52b19]">
                <MapPin size={23} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-900">Home Address</h3>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    Default
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  No address saved yet. Add your delivery address to get started.
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-bold text-[#e52b19]"
              >
                Edit
              </button>
            </div>
          </section>

          {/* Recent Orders */}
          <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Recent Orders
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your latest delicious moments.
                </p>
              </div>
              <Link
                href="/profile"
                className="text-sm font-bold text-[#e52b19] hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/30 sm:flex-row sm:items-center"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#e52b19]">
                    <Pizza size={25} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900">{order.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {order.id} · {order.date}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="font-extrabold text-gray-900">
                        {order.price}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${order.color}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-orange-200 p-2 text-[#e52b19] transition hover:bg-orange-100"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Account Security */}
          <section className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#e52b19]">
                <ShieldCheck size={25} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Account Security</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Keep your account safe and secure.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg border border-[#e52b19] px-5 py-2.5 text-sm font-bold text-[#e52b19] transition hover:bg-[#e52b19] hover:text-white"
            >
              Change Password
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#e52b19]">
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="mt-1 break-words text-sm font-bold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}
