
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import MenuItemImage from "@/app/components/shared/MenuItemImage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categories = [
  {
    name: "All Pizza",
    image: "/images/categories/allPizza.png",
    filter: "All",
  },
  {
    name: "Veg Pizza",
    image: "/images/categories/vegPizza.png",
    filter: "Veg Pizza",
  },
  {
    name: "Non-Veg Pizza",
    image: "/images/categories/nonVegPizza.png",
    filter: "Non-Veg Pizza",
  },
  {
    name: "Sides",
    image: "/images/categories/sides.png",
    filter: "Sides",
  },
  {
    name: "Drinks",
    image: "/images/categories/drinks.png",
    filter: "Drinks",
  },
  {
    name: "Desserts",
    image: "/images/categories/desserts.png",
    filter: "Desserts",
  },
];

type Pizza = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  tag?: string;
  location: string;
};

export default function BrowseMenuPage() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/menu-items`);

        if (!response.ok) {
          throw new Error("Failed to fetch menu items");
        }

        const result = await response.json();

        setPizzas(result.data || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const locations = [
    ...new Set(pizzas.map((pizza) => pizza.location)),
  ];

  const filteredPizzas = useMemo(() => {
    let result = pizzas.filter((pizza) => {
      const matchesSearch = pizza.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        pizza.category === selectedCategory;

      const matchesLocation =
        selectedLocation === "All" ||
        pizza.location === selectedLocation;

      return matchesSearch && matchesCategory && matchesLocation;
    });

    if (sortOrder === "low-to-high") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === "high-to-low") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    pizzas,
    searchTerm,
    selectedCategory,
    selectedLocation,
    sortOrder,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setSortOrder("default");
  };

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <section className="bg-[#fff1ed] px-4 py-14 text-center sm:py-20">
        <span className="mb-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#e62e20]">
          Explore Our Menu
        </span>

        <h1 className="text-3xl font-extrabold text-[#292929] sm:text-5xl">
          Find Your Favorite{" "}
          <span className="text-[#e62e20]">Pizza</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#716963] sm:text-base">
          Explore our delicious collection of freshly prepared pizzas.
          Every slice is made to bring happiness to your table.
        </p>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#e62e20]">
              Categories
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#292929] sm:text-3xl">
              Explore By Category
            </h2>
          </div>

          <p className="text-sm text-[#81766e]">
            Choose your favorite pizza category
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {categories.map((category) => (
            <button
              type="button"
              key={category.name}
              onClick={() => setSelectedCategory(category.filter)}
              className={`group flex flex-col items-center rounded-2xl border p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                selectedCategory === category.filter
                  ? "border-[#e62e20] bg-[#fff1ed]"
                  : "border-[#eee5db] bg-white hover:border-[#e62e20]"
              }`}
            >
              <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full bg-[#fff1ed]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="96px"
                  className="object-contain p-2 transition duration-300 group-hover:scale-110"
                />
              </div>

              <h3 className="text-sm font-bold text-[#292929] transition group-hover:text-[#e62e20]">
                {category.name}
              </h3>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8 lg:px-12">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[#e62e20]">
            Our Delicious Collection
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-[#292929] sm:text-3xl">
            All Pizzas
          </h2>
        </div>

        <div className="mb-8 rounded-2xl border border-[#eee5db] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-[#e62e20]" />
            <h3 className="font-bold text-[#292929]">Find Your Pizza</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81766e]"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pizza..."
                className="w-full rounded-xl border border-[#eee5db] bg-[#fffaf3] py-3 pl-11 pr-4 text-sm text-[#292929] outline-none transition placeholder:text-[#a49a92] focus:border-[#e62e20]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-[#eee5db] bg-[#fffaf3] px-4 py-3 text-sm text-[#292929] outline-none focus:border-[#e62e20]"
            >
              <option value="All">All Categories</option>
              {categories
                .filter((category) => category.filter !== "All")
                .map((category) => (
                  <option key={category.filter} value={category.filter}>
                    {category.name}
                  </option>
                ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-xl border border-[#eee5db] bg-[#fffaf3] px-4 py-3 text-sm text-[#292929] outline-none focus:border-[#e62e20]"
            >
              <option value="All">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-xl border border-[#eee5db] bg-[#fffaf3] px-4 py-3 text-sm text-[#292929] outline-none focus:border-[#e62e20]"
            >
              <option value="default">Sort By: Default</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#81766e]">
              Showing{" "}
              <span className="font-bold text-[#292929]">
                {filteredPizzas.length}
              </span>{" "}
              of {pizzas.length} pizzas
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#e62e20] transition hover:text-[#c9251a]"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="font-semibold text-[#81766e]">
              Loading pizzas...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-[#e8d8ca] bg-white px-5 py-16 text-center">
            <h3 className="text-xl font-extrabold text-[#292929]">
              Failed to Load Menu
            </h3>

            <p className="mt-2 text-sm text-[#81766e]">
              {error}. Please check whether the server is running.
            </p>
          </div>
        ) : filteredPizzas.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPizzas.map((pizza) => (
              <div
                key={pizza._id}
                className="group overflow-hidden rounded-2xl border border-[#eee5db] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-56 overflow-hidden bg-[#fff8f3]">
                  <MenuItemImage
                    images={pizza.images}
                    alt={pizza.itemName}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />

                  {pizza.tag && (
                    <span className="absolute left-4 top-4 rounded-full bg-[#e62e20] px-3 py-1.5 text-xs font-bold text-white">
                      {pizza.tag}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold text-[#e62e20]">
                    {pizza.category}
                  </p>

                  <h3 className="mt-2 text-lg font-extrabold text-[#292929]">
                    {pizza.itemName}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#81766e]">
                    {pizza.description}
                  </p>

                  <p className="mt-3 text-xs font-medium text-[#81766e]">
                    {pizza.location}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[#f0e9e2] pt-4">
                    <p className="text-xl font-extrabold text-[#e62e20]">
                      ৳{pizza.price}
                    </p>

                    <Link
                      href={`/menu/${pizza._id}`}
                      className="rounded-lg bg-[#e62e20] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#c9251a]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e8d8ca] bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1ed]">
              <Search size={28} className="text-[#e62e20]" />
            </div>

            <h3 className="mt-5 text-xl font-extrabold text-[#292929]">
              No Pizzas Found
            </h3>

            <p className="mt-2 text-sm text-[#81766e]">
              We couldn&apos;t find any pizzas matching your filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-lg bg-[#e62e20] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c9251a]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
