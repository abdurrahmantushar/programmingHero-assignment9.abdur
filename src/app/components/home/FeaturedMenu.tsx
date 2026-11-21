
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Plus,
  Crown,
  MapPin,
  Loader2,
} from "lucide-react";

type MenuItem = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  isAvailable: boolean;
};

type PremiumMenuItem = MenuItem & {
  vendorName: string;
  subscriptionPlan: string;
};

export default function FeaturedMenu() {
  const [premiumItems, setPremiumItems] = useState<PremiumMenuItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    const fetchPremiumItems = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/premium-featured`
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setPremiumItems(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch premium menu items:", error);
      } finally {
        setPremiumLoading(false);
      }
    };

    const fetchFeaturedItems = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/menu-items`
        );

        const result = await response.json();

        if (response.ok && result.success) {
          const availableItems = (result.data || [])
            .filter((item: MenuItem) => item.isAvailable === true)
            .slice(0, 4);

          setFeaturedItems(availableItems);
        }
      } catch (error) {
        console.error("Failed to fetch featured menu items:", error);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchPremiumItems();
    fetchFeaturedItems();
  }, []);

  return (
    <>
      {!premiumLoading && premiumItems.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 pb-12 pt-12 sm:px-8 lg:px-12">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e6392e]">
                <Crown size={15} />
                Premium Restaurants
              </div>

              <h2 className="text-2xl font-extrabold text-[#25211e] sm:text-3xl">
                Premium Featured Menu
              </h2>

              <p className="mt-2 text-sm text-[#77716b]">
                Discover exclusive dishes from our Premium vendors.
              </p>
            </div>

            <Link
              href="/browse-menu"
              className="hidden items-center gap-2 text-sm font-bold text-[#e6392e] transition hover:gap-3 sm:flex"
            >
              View All
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {premiumItems.map((item) => (
              <div
                key={item._id}
                className="group overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-[210px] overflow-hidden bg-[#fff2e5]">
                  <img
                    src={item.images?.[0] || "/images/pizzas/margherita.jpg"}
                    alt={item.itemName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[10px] font-extrabold text-white shadow-md">
                    <Crown size={12} />
                    PREMIUM
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-[#25211e]">
                      {item.itemName}
                    </h3>

                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">
                      {item.category}
                    </span>
                  </div>

                  <p className="mt-2 min-h-[44px] text-xs leading-5 text-[#77716b]">
                    {item.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={13} />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-gray-500">
                    By {item.vendorName}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-[#e6392e]">
                      ৳{item.price}
                    </span>

                    <Link
                      href={`/menu/${item._id}`}
                      aria-label={`View ${item.itemName}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6392e] text-white shadow-md transition hover:scale-110 hover:bg-[#c9251a]"
                    >
                      <Plus size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/browse-menu"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-[#e6392e] sm:hidden"
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-12 sm:px-8 lg:px-12">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#e6392e]">
              OUR SPECIALS
            </p>

            <h2 className="text-2xl font-extrabold text-[#25211e] sm:text-3xl">
              Featured Pizzas
            </h2>
          </div>

          <Link
            href="/browse-menu"
            className="flex items-center gap-2 text-sm font-bold text-[#e6392e] transition hover:gap-3"
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="animate-spin text-[#e6392e]" size={30} />
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="rounded-xl border border-[#eee5db] bg-white py-12 text-center">
            <h3 className="font-bold text-[#25211e]">
              No Featured Pizzas Available
            </h3>
            <p className="mt-2 text-sm text-[#77716b]">
              Check back later for delicious new menu items.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredItems.map((item) => (
              <div
                key={item._id}
                className="group overflow-hidden rounded-xl border border-[#eee5db] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-[210px] overflow-hidden bg-[#fff2e5]">
                  <img
                    src={item.images?.[0] || "/images/pizzas/margherita.jpg"}
                    alt={item.itemName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-[#e6392e] px-3 py-1.5 text-[10px] font-extrabold text-white">
                    FEATURED
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-bold text-[#25211e]">
                    {item.itemName}
                  </h3>

                  <p className="mt-2 min-h-[44px] text-xs leading-5 text-[#77716b]">
                    {item.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={13} />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-[#e6392e]">
                      ৳{item.price}
                    </span>

                    <Link
                      href={`/menu/${item._id}`}
                      aria-label={`View ${item.itemName}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6392e] text-white shadow-md transition hover:scale-110 hover:bg-[#c9251a]"
                    >
                      <Plus size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
