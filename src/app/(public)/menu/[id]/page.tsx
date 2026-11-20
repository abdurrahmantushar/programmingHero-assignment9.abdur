
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, ShoppingBag } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface MenuItem {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  tag?: string;
  location: string;
}

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

      useEffect(() => {
      params.then(({ id }) => setId(id));
    }, [params]);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }



    if (!id) return;

    const fetchPizza = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/menu-items/${id}`,
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
  }, [id, session, isPending, router]);

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

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
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
            {pizza.images?.[0] ? (
              <Image
                src={pizza.images[0]}
                alt={pizza.itemName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            {pizza.tag && (
              <span className="mb-4 w-fit rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-[#e62e20]">
                {pizza.tag}
              </span>
            )}

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
              Description
            </h2>

            <p className="leading-7 text-gray-600">
              {pizza.description || "No description available."}
            </p>

            <div className="mt-6 flex items-center gap-2 text-gray-600">
              <MapPin size={19} className="text-[#e62e20]" />
              <span>{pizza.location}</span>
            </div>

          <button
            type="button"
            onClick={() => router.push(`/order/${pizza._id}`)}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-6 py-4 font-semibold text-white transition hover:bg-[#c92318]"
          >
            <ShoppingBag size={20} />
            Order Now
          </button>
          </div>
        </div>
      </div>
    </section>
  );
}
