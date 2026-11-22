
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  MapPin,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Utensils,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import MenuItemImage from "@/app/components/shared/MenuItemImage";
import { toast } from "sonner";

interface Favorite {
  _id: string;
  itemId: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  location: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function FavoritesPage() {
  const { data: session, isPending } = authClient.useSession();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/customer/${session.user.id}/favorites`,
          { credentials: "include", cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch favorites");
        }

        setFavorites(result.data || []);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load favorites"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [session, isPending]);

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (removingId) return;

    try {
      setRemovingId(favoriteId);

      const response = await fetch(
        `${API_URL}/api/favorites/${favoriteId}`,
        { credentials: "include",
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to remove favorite");
      }

      setFavorites((prev) =>
        prev.filter((favorite) => favorite._id !== favoriteId)
      );

      toast.success("Removed from favorites");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setRemovingId("");
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#fffaf3] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#e62e20]">
              <Heart size={22} className="fill-[#e62e20]" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Your Collection
              </span>
            </div>

            <h1 className="text-3xl font-bold text-[#292929] sm:text-4xl">
              My Favorites
            </h1>

            <p className="mt-2 text-gray-500">
              All your favorite pizzas in one place.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-xl border border-[#f1e5d9] bg-white px-5 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-[#e62e20]">
              <Heart size={20} className="fill-[#e62e20]" />
            </div>

            <div>
              <p className="text-xl font-bold text-[#292929]">
                {favorites.length}
              </p>
              <p className="text-xs text-gray-500">Saved Items</p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#e9d9ca] bg-white px-5 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <Heart size={36} className="text-[#e62e20]" />
            </div>

            <h2 className="text-2xl font-bold text-[#292929]">
              No Favorites Yet
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
              You haven't saved any pizzas yet. Explore our menu and add
              your favorite pizzas to your collection.
            </p>

            <Link
              href="/browse-menu"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#e62e20] px-6 py-3 font-semibold text-white transition hover:bg-[#c92318]"
            >
              <ShoppingBag size={19} />
              Explore Menu
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#292929]">
                Saved Pizzas
              </h2>

              <span className="text-sm text-gray-500">
                {favorites.length}{" "}
                {favorites.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {favorites.map((favorite) => (
                <div
                  key={favorite._id}
                  className="group overflow-hidden rounded-2xl border border-[#f1e5d9] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    {favorite.images?.[0] ? (
                      <MenuItemImage
                        images={favorite.images}
                        alt={favorite.itemName}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        No image available
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#e62e20] shadow-sm">
                      {favorite.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(favorite._id)}
                      disabled={removingId === favorite._id}
                      aria-label="Remove from favorites"
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#e62e20] shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingId === favorite._id ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#e62e20] border-t-transparent" />
                      ) : (
                        <Heart size={20} className="fill-[#e62e20]" />
                      )}
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-[#292929]">
                        {favorite.itemName}
                      </h3>

                      <p className="shrink-0 text-lg font-bold text-[#e62e20]">
                        ৳{favorite.price}
                      </p>
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-gray-500">
                      {favorite.description ||
                        "No description available."}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={17} className="shrink-0 text-[#e62e20]" />
                      <span className="truncate">{favorite.location}</span>
                    </div>

                    <div className="my-5 h-px bg-[#eee5db]" />

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/menu/${favorite.itemId}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c92318]"
                      >
                        <Utensils size={17} />
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveFavorite(favorite._id)
                        }
                        disabled={removingId === favorite._id}
                        aria-label="Remove favorite"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-100 text-[#e62e20] transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
