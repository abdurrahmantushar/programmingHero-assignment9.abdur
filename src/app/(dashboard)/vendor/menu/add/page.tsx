
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { CATEGORY_OPTIONS } from "@/constants/categories";
import {
  ArrowLeft,
  ImagePlus,
  X,
  UtensilsCrossed,
  MapPin,
  DollarSign,
  Package,
  FileText,
  Crown,
  LockKeyhole,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

type SubscriptionData = {
  vendorId: string;
  name: string;
  email: string;
  subscriptionPlan: string;
  subscriptionExpiresAt: string | null;
  totalMenuItems: number;
  menuLimit: number | null;
  remainingMenuItems: number | null;
  features: {
    unlimitedMenuItems: boolean;
    featuredHomepage: boolean;
    premiumBadge: boolean;
  };
};

export default function AddMenuItemPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [subscription, setSubscription] =
    useState<SubscriptionData | null>(null);

  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.id) {
      setLoadingSubscription(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `/api/vendor/${session.user.id}/subscription`,
          { credentials: "include", cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load subscription information."
          );
        }

        setSubscription(result.data);
      } catch (error) {
        console.error("Subscription Fetch Error:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load subscription information."
        );
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [session, isPending]);

  const isPremium =
    subscription?.subscriptionPlan === "premium" ||
    subscription?.features?.unlimitedMenuItems === true;

  const hasReachedFreeLimit =
    subscription?.subscriptionPlan === "free" &&
    subscription.totalMenuItems >= 3;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 8 - images.length;

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length > remaining) {
      toast.error("Maximum 8 images can be uploaded.");
    }

    const selectedFiles = validFiles.slice(0, remaining);

    const newPreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImages((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPending) {
      toast.error("Please wait. Loading your account...");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please login with your vendor account.");
      return;
    }

    if (hasReachedFreeLimit) {
      toast.error("You have reached your free menu limit.");
      router.push("/vendor/subscription");
      return;
    }

    if (!images.length) {
      toast.error("Please upload at least one image.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      toast.error("ImgBB API key is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setUploadingImages(true);

      const formData = new FormData(e.currentTarget);

      const itemName = String(formData.get("itemName") || "").trim();
      const category = String(formData.get("category") || "");
      const description = String(formData.get("description") || "").trim();
      const price = Number(formData.get("price"));
      const quantity = Number(formData.get("quantity"));
      const location = String(formData.get("location") || "").trim();

      if (!itemName || !category || !description || !location) {
        toast.error("Please fill in all required fields.");
        return;
      }

      if (!Number.isFinite(price) || price <= 0) {
        toast.error("Please enter a valid price.");
        return;
      }

      if (!Number.isInteger(quantity) || quantity < 0) {
        toast.error("Please enter a valid quantity.");
        return;
      }

      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const uploadFormData = new FormData();
          uploadFormData.append("image", image);

          const uploadResponse = await fetch(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            {
              method: "POST",
              body: uploadFormData,
            }
          );

          const uploadResult = await uploadResponse.json();

          if (!uploadResponse.ok || !uploadResult.success) {
            throw new Error(
              uploadResult.error?.message || "Image upload failed."
            );
          }

          return uploadResult.data.url;
        })
      );

      setUploadingImages(false);

      const menuData = {
        itemName,
        category,
        description,
        price,
        quantity,
        location,
        images: imageUrls,
      };

      const response = await fetch(
        `/api/vendor/${session.user.id}/menu-items`,
        { credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(menuData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create menu item.");
      }

      toast.success("Menu item created successfully!");

      router.push("/vendor/menu");
      router.refresh();
    } catch (error) {
      console.error("Create Menu Item Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  if (isPending || loadingSubscription) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  if (!subscription) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <LockKeyhole size={38} className="mx-auto text-red-500" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          Unable to Load Subscription
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Please try again before adding a menu item.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-[#e62e20] px-6 py-3 text-sm font-bold text-white hover:bg-[#c92318]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (hasReachedFreeLimit) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Link prefetch={false}
          href="/vendor/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#e62e20]"
        >
          <ArrowLeft size={18} />
          Back to My Menu
        </Link>

        <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-orange-500 to-[#e62e20] px-6 py-10 text-center text-white sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Crown size={34} />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
              You've Reached Your Free Menu Limit!
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/90">
              You've already added 3 menu items with your Free plan.
              Upgrade to Premium to add unlimited menu items and grow your
              restaurant on PizzaHub.
            </p>
          </div>

          <div className="p-6 sm:p-9">
            <div className="mb-7 rounded-xl border border-orange-100 bg-orange-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">
                  Free Plan Usage
                </span>

                <span className="text-sm font-extrabold text-[#e62e20]">
                  {subscription.totalMenuItems}/3
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-orange-100">
                <div className="h-full w-full rounded-full bg-[#e62e20]" />
              </div>

              <p className="mt-3 text-xs text-gray-500">
                You've used all your available free menu slots.
              </p>
            </div>

            <h2 className="text-lg font-extrabold text-gray-900">
              Unlock Premium Benefits
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="shrink-0 text-green-600" />
                <span className="text-sm text-gray-700">
                  Add unlimited menu items
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="shrink-0 text-green-600" />
                <span className="text-sm text-gray-700">
                  Get featured on the PizzaHub homepage
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="shrink-0 text-green-600" />
                <span className="text-sm text-gray-700">
                  Get a Premium badge for your restaurant
                </span>
              </div>
            </div>

            <Link prefetch={false}
              href="/vendor/subscription"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#c92318]"
            >
              <Crown size={19} />
              Upgrade to Premium
              <ArrowRight size={18} />
            </Link>

            <p className="mt-4 text-center text-xs text-gray-400">
              Upgrade your plan to continue adding menu items.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <Link prefetch={false}
          href="/vendor/menu"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#e62e20]"
        >
          <ArrowLeft size={18} />
          Back to My Menu
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Add New Menu Item
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Add delicious items to your restaurant menu and let customers
            discover them on PizzaHub.
          </p>

          {isPremium && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
              <Crown size={15} />
              Premium Plan - Unlimited Menu Items
            </div>
          )}

          {!isPremium && subscription.subscriptionPlan === "free" && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
              <CheckCircle2 size={15} />
              Free Plan - {subscription.remainingMenuItems ?? Math.max(0, 3 - subscription.totalMenuItems)} menu slots remaining
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#e62e20]">
              <UtensilsCrossed size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Basic Information
              </h2>
              <p className="text-xs text-gray-500">
                Provide details about your menu item
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Item Name *
              </label>
              <input
                type="text"
                name="itemName"
                required
                placeholder="e.g. Margherita Pizza"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#e62e20] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category *
              </label>
              <select
                name="category"
                required
                defaultValue=""
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#e62e20] focus:ring-2 focus:ring-orange-100"
              >
                <option value="" disabled>
                  Select category
                </option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Price (৳) *
              </label>
              <div className="relative">
                <DollarSign
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="number"
                  name="price"
                  required
                  min="1"
                  placeholder="299"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e62e20] focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Available Quantity *
              </label>
              <div className="relative">
                <Package
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="number"
                  name="quantity"
                  required
                  min="0"
                  placeholder="20"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e62e20] focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Location *
              </label>
              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Panchlaish, Chattogram"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e62e20] focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description *
              </label>
              <div className="relative">
                <FileText
                  size={17}
                  className="absolute left-4 top-4 text-gray-400"
                />
                <textarea
                  name="description"
                  required
                  rows={5}
                  placeholder="Describe your delicious menu item..."
                  className="w-full resize-none rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e62e20] focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#e62e20]">
              <ImagePlus size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Item Images
              </h2>
              <p className="text-xs text-gray-500">
                Upload up to 8 images of your menu item
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {previews.map((preview, index) => (
              <div
                key={preview}
                className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
              >
                <img
                  src={preview}
                  alt={`Menu item preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <X size={17} />
                </button>
              </div>
            ))}

            {images.length < 8 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/50 text-center transition hover:border-[#e62e20] hover:bg-orange-50">
                <ImagePlus size={30} className="text-[#e62e20]" />
                <span className="mt-2 text-sm font-bold text-gray-700">
                  Add Image
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  {images.length}/8 selected
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            You can upload a maximum of 8 images.
          </p>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link prefetch={false}
            href="/vendor/menu"
            className="rounded-xl border border-gray-200 px-6 py-3 text-center text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || isPending}
            className="rounded-xl bg-[#e62e20] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#c92318] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? uploadingImages
                ? "Uploading Images..."
                : "Creating Menu Item..."
              : "Create Menu Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
