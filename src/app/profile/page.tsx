"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
    UserRound,
    ShoppingBag,
    MapPin,
    LogOut,
    Pencil,
    Mail,
    Phone,
    CalendarDays,
    ChevronRight,
    Pizza,
    ShieldCheck,
    Plus,
    Camera,
    Star,
    Clock3,
    CheckCircle2,
    type LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const menuItems = [
  { label: "My Profile", icon: UserRound, active: true },
];

type Order = {
  _id: string;
  itemName: string;
  totalPrice: number;
  quantity: number;
  status: string;
  createdAt: string;
  customerName?: string;
};

type DashboardData = {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  recentOrders: Order[];
};

type VendorDashboardData = {
  totalMenuItems: number;
  pendingMenuItems: number;
  approvedMenuItems: number;
  rejectedMenuItems: number;
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  rejectedOrders: number;
  recentOrders: Order[];
};

type VendorSubscription = {
  subscriptionPlan: "free" | "premium";
  subscriptionExpiresAt: string | null;
  totalMenuItems: number;
  menuLimit: number | null;
  remainingMenuItems: number | null;
};

type VendorMenuItem = {
  _id: string;
  itemName: string;
  price: number;
  status: string;
  location?: string;
};

type Address = {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  isDefault: boolean;
};

const statusStyles: Record<string, string> = {
  pending: "bg-orange-50 text-orange-600",
  accepted: "bg-blue-50 text-blue-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-600",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const userId = user?.id;
  const role = String(user?.role ?? "customer");
  const isVendor = role === "vendor";
  const isAdmin = role === "admin";

  const [loggingOut, setLoggingOut] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [vendorDashboard, setVendorDashboard] =
    useState<VendorDashboardData | null>(null);
  const [subscription, setSubscription] = useState<VendorSubscription | null>(
    null
  );
  const [vendorMenuItems, setVendorMenuItems] = useState<VendorMenuItem[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImage = uploadedImage ?? user?.image ?? null;

  useEffect(() => {
    if (!userId) return;

    const loadProfileData = async () => {
      try {
        if (isVendor) {
          const [dashboardResponse, subscriptionResponse, menuResponse] =
            await Promise.all([
              fetch(`${API_URL}/api/vendor/${userId}/dashboard`),
              fetch(`${API_URL}/api/vendor/${userId}/subscription`),
              fetch(`${API_URL}/api/vendor/${userId}/menu-items`),
            ]);

          const [dashboardResult, subscriptionResult, menuResult] =
            await Promise.all([
              dashboardResponse.json(),
              subscriptionResponse.json(),
              menuResponse.json(),
            ]);

          if (dashboardResponse.ok && dashboardResult.success) {
            setVendorDashboard(dashboardResult.data);
          }

          if (subscriptionResponse.ok && subscriptionResult.success) {
            setSubscription(subscriptionResult.data);
          }

          if (menuResponse.ok && menuResult.success) {
            setVendorMenuItems(menuResult.data || []);
          }
        } else if (!isAdmin) {
          const [dashboardResponse, addressesResponse] = await Promise.all([
            fetch(`${API_URL}/api/customer/${userId}/dashboard`),
            fetch(`${API_URL}/api/customer/${userId}/addresses`),
          ]);

          const [dashboardResult, addressesResult] = await Promise.all([
            dashboardResponse.json(),
            addressesResponse.json(),
          ]);

          if (dashboardResponse.ok && dashboardResult.success) {
            setDashboard(dashboardResult.data);
          }

          if (addressesResponse.ok && addressesResult.success) {
            setAddresses(addressesResult.data || []);
          }
        }
      } catch {
        toast.error("Unable to load profile data.");
      }
    };

    loadProfileData();
  }, [userId, isVendor, isAdmin]);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please choose an image smaller than 2MB.");
      return;
    }

    try {
      setUploadingImage(true);

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to read the image"));
        reader.readAsDataURL(file);
      });

      // Uses the existing Better Auth endpoint: POST /api/auth/update-user
      const { error } = await authClient.updateUser({ image: dataUrl });

      if (error) {
        toast.error(error.message || "Unable to update profile picture.");
        return;
      }

      setUploadedImage(dataUrl);
      toast.success("Profile picture updated");
      router.refresh();
    } catch {
      toast.error("Unable to update profile picture.");
    } finally {
      setUploadingImage(false);
    }
  };

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
  const roleLabel = isVendor
    ? "Vendor Partner"
    : isAdmin
      ? "Administrator"
      : "Pizza Lover";
  const accountRole = isVendor ? "Vendor" : isAdmin ? "Admin" : "Customer";
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

  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0];
  const location = isVendor
    ? vendorMenuItems[0]?.location || "Not provided"
    : defaultAddress
      ? [defaultAddress.area, defaultAddress.city, defaultAddress.postalCode]
          .filter(Boolean)
          .join(", ")
      : "Not provided";

  const stats = isVendor
    ? [
        {
          label: "Total Menu Items",
          value: vendorDashboard?.totalMenuItems ?? 0,
          icon: Pizza,
        },
        {
          label: "Total Orders",
          value: vendorDashboard?.totalOrders ?? 0,
          icon: ShoppingBag,
        },
        {
          label: "Pending Orders",
          value: vendorDashboard?.pendingOrders ?? 0,
          icon: Clock3,
        },
      ]
    : [
        {
          label: "Total Orders",
          value: dashboard?.totalOrders ?? 0,
          icon: ShoppingBag,
        },
        {
          label: "Pending Orders",
          value: dashboard?.pendingOrders ?? 0,
          icon: Clock3,
        },
        {
          label: "Accepted Orders",
          value: dashboard?.acceptedOrders ?? 0,
          icon: CheckCircle2,
        },
      ];

  const recentOrders = isVendor
    ? (vendorDashboard?.recentOrders ?? [])
    : (dashboard?.recentOrders ?? []);

  const ordersHref = isVendor ? "/vendor/orders" : "/customer/orders";

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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="relative">
              {profileImage ? (
                <Image
                  src={profileImage}
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
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full bg-[#e52b19] p-2 text-white shadow-md transition hover:bg-red-700 disabled:opacity-60"
              >
                <Camera size={15} />
              </button>
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">{name}</h2>
            <p className="mt-1 text-sm text-gray-500">{email}</p>
            <span className="mt-3 rounded-full bg-orange-50 px-4 py-1 text-xs font-bold text-[#e52b19]">
              <Star size={12} className="mr-1 inline" />
              {roleLabel}
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
                {isVendor
                  ? "Manage your menu, customer orders and subscription from one place."
                  : isAdmin
                    ? "Manage users, menu approvals and platform activity from one place."
                    : "Your favorite pizzas are just a few clicks away. Check your orders and enjoy something delicious!"}
              </p>
            </div>
            <Pizza
              size={155}
              className="absolute -bottom-8 -right-5 rotate-12 text-white/15 sm:right-10"
            />
          </section>

          {/* Stats */}
          {!isAdmin && (
            <section className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {stats.map((stat) => {
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
          )}

          {/* Vendor Subscription */}
          {isVendor && (
            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Subscription
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Your current vendor plan and menu limits.
                  </p>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-[#e52b19]">
                  {subscription?.subscriptionPlan ?? "free"}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <InfoItem
                  icon={Star}
                  label="Current Plan"
                  value={
                    subscription?.subscriptionPlan === "premium"
                      ? "Premium"
                      : "Free"
                  }
                />
                <InfoItem
                  icon={ShoppingBag}
                  label="Menu Items"
                  value={
                    subscription
                      ? `${subscription.totalMenuItems} / ${subscription.menuLimit ?? "Unlimited"}`
                      : "Not available"
                  }
                />
                <InfoItem
                  icon={CalendarDays}
                  label="Expires"
                  value={
                    subscription?.subscriptionExpiresAt
                      ? new Date(
                          subscription.subscriptionExpiresAt
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "No expiry"
                  }
                />
              </div>
            </section>
          )}

          {/* Vendor Menu Overview */}
          {isVendor && (
            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    My Menu Items
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Your latest menu submissions.
                  </p>
                </div>
                <Link
                  href="/vendor/menu"
                  className="text-sm font-bold text-[#e52b19] hover:underline"
                >
                  View All
                </Link>
              </div>

              {vendorMenuItems.length === 0 ? (
                <div className="py-8 text-center">
                  <Pizza className="mx-auto text-gray-300" size={36} />
                  <p className="mt-3 font-semibold text-gray-700">
                    No menu items yet
                  </p>
                  <Link
                    href="/vendor/menu/add"
                    className="mt-2 inline-block text-sm font-bold text-[#e52b19]"
                  >
                    Add Menu Item
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorMenuItems.slice(0, 3).map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#e52b19]">
                        <Pizza size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-gray-900">
                          {item.itemName}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          ৳{item.price}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          statusStyles[item.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Admin Shortcuts */}
          {isAdmin && (
            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-extrabold text-gray-900">
                Admin Shortcuts
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Quick access to platform management.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/50 p-4 text-sm font-bold text-gray-800 transition hover:border-[#e52b19] hover:text-[#e52b19]"
                >
                  <UserRound size={20} className="text-[#e52b19]" />
                  Manage Users
                </Link>
                <Link
                  href="/admin/menu"
                  className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/50 p-4 text-sm font-bold text-gray-800 transition hover:border-[#e52b19] hover:text-[#e52b19]"
                >
                  <Pizza size={20} className="text-[#e52b19]" />
                  Manage Menu Items
                </Link>
                <Link
                  href="/admin/transactions"
                  className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/50 p-4 text-sm font-bold text-gray-800 transition hover:border-[#e52b19] hover:text-[#e52b19]"
                >
                  <ShoppingBag size={20} className="text-[#e52b19]" />
                  Transactions
                </Link>
              </div>
            </section>
          )}

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
                value={defaultAddress?.phone || "Not provided"}
              />
              <InfoItem
                icon={ShieldCheck}
                label="Account Role"
                value={accountRole}
              />
              <InfoItem icon={CalendarDays} label="Member Since" value={joined} />
              <InfoItem icon={MapPin} label="Location" value={location} />
              <InfoItem
                icon={ShieldCheck}
                label="Email Verification"
                value={accountStatus}
              />
            </div>
          </section>

          {/* Address */}
          {!isVendor && !isAdmin && (
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
              <Link
                href="/customer/addresses"
                className="flex items-center gap-1 text-sm font-bold text-[#e52b19] hover:text-red-700"
              >
                <Plus size={18} />
                Add New
              </Link>
            </div>

            {defaultAddress ? (
              <div className="flex flex-col gap-4 rounded-xl border border-orange-200 bg-orange-50/50 p-5 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#e52b19]">
                  <MapPin size={23} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900">
                      {defaultAddress.label}
                    </h3>
                    {defaultAddress.isDefault && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {defaultAddress.address}, {defaultAddress.area},{" "}
                    {defaultAddress.city} - {defaultAddress.postalCode}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {defaultAddress.fullName} · {defaultAddress.phone}
                  </p>
                </div>
                <Link
                  href="/customer/addresses"
                  className="text-sm font-bold text-[#e52b19]"
                >
                  Edit
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-xl border border-orange-200 bg-orange-50/50 p-5 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#e52b19]">
                  <MapPin size={23} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900">Home Address</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    No address saved yet. Add your delivery address to get started.
                  </p>
                </div>
              </div>
            )}
          </section>
          )}

          {/* Recent Orders */}
          {!isAdmin && (
          <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Recent Orders
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isVendor
                    ? "Your latest customer orders."
                    : "Your latest delicious moments."}
                </p>
              </div>
              <Link
                href={ordersHref}
                className="text-sm font-bold text-[#e52b19] hover:underline"
              >
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-10 text-center">
                <ShoppingBag className="mx-auto text-gray-300" size={40} />
                <p className="mt-3 font-semibold text-gray-700">No orders yet</p>
                <Link
                  href={isVendor ? "/vendor/orders" : "/browse-menu"}
                  className="mt-3 inline-block text-sm font-bold text-[#e52b19]"
                >
                  {isVendor ? "View Orders" : "Explore Menu"}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/30 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#e52b19]">
                      <Pizza size={25} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900">
                        {order.itemName}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        #{order._id.slice(-6)} ·{" "}
                        {order.customerName ? `${order.customerName} · ` : ""}
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
                        <p className="font-extrabold text-gray-900">
                          ৳{order.totalPrice}
                        </p>
                        <span
                          className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            statusStyles[order.status] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <Link
                        href={
                          isVendor ? "/vendor/orders" : `/customer/orders/${order._id}`
                        }
                        className="rounded-full border border-orange-200 p-2 text-[#e52b19] transition hover:bg-orange-100"
                        aria-label="View order details"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}

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
