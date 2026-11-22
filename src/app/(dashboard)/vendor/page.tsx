
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  X,
  UtensilsCrossed,
  MapPin,
  DollarSign,
  Package,
  FileText,
  Plus,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function AddMenuItemPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 8 - images.length;

    if (files.length > remaining) {
      toast.error("You can upload a maximum of 8 images.");
    }

    const selectedFiles = files.slice(0, remaining);

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    const newPreviews = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImages((prev) => [...prev, ...validFiles]);
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

    if (isPending || !session?.user?.id) {
      toast.error("Please sign in as a vendor.");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one menu image.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      toast.error("ImgBB API key is missing.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData(e.currentTarget);

      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const uploadData = new FormData();
          uploadData.append("image", image);

          const uploadResponse = await fetch(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            {
              method: "POST",
              body: uploadData,
            }
          );

          const uploadResult = await uploadResponse.json();

          if (!uploadResponse.ok || !uploadResult.success) {
            throw new Error("Image upload failed.");
          }

          return uploadResult.data.url;
        })
      );

      const menuData = {
        itemName: String(formData.get("itemName") || ""),
        category: String(formData.get("category") || ""),
        description: String(formData.get("description") || ""),
        price: Number(formData.get("price")),
        quantity: Number(formData.get("quantity")),
        location: String(formData.get("location") || ""),
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
        throw new Error(
          result.message || "Failed to create menu item."
        );
      }

      toast.success("Menu item created successfully!");

      router.push("/vendor/menu");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Special">Special</option>
                <option value="Dessert">Dessert</option>
                <option value="Drinks">Drinks</option>
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
              <h2 className="font-bold text-gray-900">Item Images</h2>
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
                <Plus size={30} className="text-[#e62e20]" />
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
            {submitting ? "Creating Menu Item..." : "Create Menu Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
