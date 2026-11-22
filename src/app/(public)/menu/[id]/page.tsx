
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  Heart,
  CheckCircle2,
  XCircle,
  Utensils,
  Tag,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import MenuItemImage from "@/app/components/shared/MenuItemImage";
import toast from "react-hot-toast";

interface MenuItem {
  _id: string;
  vendorId: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  tag?: string;
  location: string;
  status: string;
  isAvailable: boolean;
}

interface Favorite {
  _id: string;
  itemId: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PizzaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState("");
  const { data: session, isPending } = authClient.useSession();

  const [pizza, setPizza] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState("");
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchPizza = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/menu-items/${id}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load pizza");
        }

        setPizza(result.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPizza();
  }, [id]);

  useEffect(() => {
    if (!session?.user?.id || !pizza?._id || session.user.role !== "customer") {
      return;
    }

    const fetchFavoriteStatus = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/customer/${session.user.id}/favorites`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) return;

        const favorite = result.data?.find(
          (item: Favorite) => String(item.itemId) === pizza._id
        );

        if (favorite) {
          setIsFavorite(true);
          setFavoriteId(favorite._id);
        } else {
          setIsFavorite(false);
          setFavoriteId("");
        }
      } catch (error) {
        console.error("Favorite Status Error:", error);
      }
    };

    fetchFavoriteStatus();
  }, [session, pizza]);

  const handleFavorite = async () => {
    if (!session?.user?.id || !pizza || favoriteLoading) return;

    if (session.user.role !== "customer") return;

    setFavoriteLoading(true);

    try {
      if (isFavorite && favoriteId) {
        const response = await fetch(
          `${API_URL}/api/favorites/${favoriteId}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to remove favorite");
        }

        setIsFavorite(false);
        setFavoriteId("");
      } else {
        const response = await fetch(`${API_URL}/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: session.user.id,
            itemId: pizza._id,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to add favorite");
        }

        setIsFavorite(true);
        setFavoriteId(result.data._id);
      }
    } catch (error) {
      console.error("Favorite Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !pizza) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {error || "Pizza not found"}
        </h2>

        <Link
          href="/browse-menu"
          className="mt-5 rounded-lg bg-[#e62e20] px-6 py-3 font-semibold text-white"
        >
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#fffaf3] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/browse-menu"
          className="mb-8 inline-flex items-center gap-2 font-medium text-gray-600 transition hover:text-[#e62e20]"
        >
          <ArrowLeft size={18} />
          Back to Menu
        </Link>

        <div className="grid gap-10 rounded-2xl bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              {pizza.images?.[0] ? (
                <MenuItemImage
                  images={pizza.images}
                  alt={pizza.itemName}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image available
                </div>
              )}

              {pizza.tag && (
                <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#e62e20] shadow-sm">
                  <Tag size={15} />
                  {pizza.tag}
                </span>
              )}

              {session?.user?.role === "customer" && (
                <button
                  type="button"
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  aria-label={
                    isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 disabled:opacity-60"
                >
                  <Heart
                    size={22}
                    className={
                      isFavorite
                        ? "fill-[#e62e20] text-[#e62e20]"
                        : "text-gray-600"
                    }
                  />
                </button>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#fffaf3] p-4">
                <div className="mb-2 flex items-center gap-2 text-gray-500">
                  <Utensils size={17} className="text-[#e62e20]" />
                  <span className="text-sm">Category</span>
                </div>
                <p className="font-semibold text-[#292929]">
                  {pizza.category}
                </p>
              </div>

              <div className="rounded-xl bg-[#fffaf3] p-4">
                <div className="mb-2 flex items-center gap-2 text-gray-500">
                  {pizza.isAvailable ? (
                    <CheckCircle2 size={17} className="text-green-600" />
                  ) : (
                    <XCircle size={17} className="text-red-600" />
                  )}
                  <span className="text-sm">Availability</span>
                </div>

                <p
                  className={`font-semibold ${
                    pizza.isAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {pizza.isAvailable ? "Available" : "Unavailable"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#e62e20]">
              {pizza.category}
            </p>

            <h1 className="text-3xl font-bold text-[#292929] sm:text-4xl">
              {pizza.itemName}
            </h1>

            <p className="mt-5 text-3xl font-bold text-[#e62e20]">
              ৳{pizza.price}
            </p>

            <div className="my-6 h-px bg-[#eee5db]" />

            <h2 className="mb-2 text-lg font-semibold text-[#292929]">
              About This Pizza
            </h2>

            <p className="leading-7 text-gray-600">
              {pizza.description || "No description available."}
            </p>

            <div className="mt-7 rounded-xl bg-[#fffaf3] p-5">
              <h2 className="mb-4 font-semibold text-[#292929]">
                Product Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Product Name</span>
                  <span className="text-right font-medium text-[#292929]">
                    {pizza.itemName}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-[#292929]">
                    {pizza.category}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Price</span>
                  <span className="font-semibold text-[#e62e20]">
                    ৳{pizza.price}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Availability</span>
                  <span
                    className={`font-medium ${
                      pizza.isAvailable
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {pizza.isAvailable ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 text-gray-600">
              <MapPin
                size={20}
                className="mt-0.5 shrink-0 text-[#e62e20]"
              />
              <div>
                <p className="font-semibold text-[#292929]">
                  Restaurant Location
                </p>
                <p className="mt-1">{pizza.location}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  session?.user ? `/order/${pizza._id}` : "/sign-in"
                )
              }
              disabled={!pizza.isAvailable}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-6 py-4 font-semibold text-white transition hover:bg-[#c92318] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <ShoppingBag size={20} />
              {pizza.isAvailable ? "Order Now" : "Currently Unavailable"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Freshly prepared and delivered to your doorstep.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
