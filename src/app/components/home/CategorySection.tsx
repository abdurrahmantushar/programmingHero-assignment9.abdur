
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/constants/categories";

const CATEGORY_IMAGES = [
  "/images/categories/vegPizza.png",
  "/images/categories/nonVegPizza.png",
  "/images/categories/sides.png",
  "/images/categories/drinks.png",
  "/images/categories/desserts.png",
];

const categories = [
  {
    name: "All Pizza",
    image: "/images/categories/allPizza.png",
  },
  ...CATEGORIES.map((category, index) => ({
    name: category,
    image: CATEGORY_IMAGES[index] || "/images/categories/allPizza.png",
  })),
];

export default function CategorySection() {
  return (
  <section className="relative z-20 mx-auto -mt-12 max-w-[1440px] px-5 sm:px-8 lg:px-12">
      <div className="grid grid-cols-2 gap-5 rounded-2xl border border-[#f0ebe5] bg-white px-5 py-7 shadow-lg shadow-black/10 sm:grid-cols-3 lg:grid-cols-6 lg:px-8">
        {categories.map((category) => (
          <Link
            href="/browse-menu"
            key={category.name}
            className="group flex flex-col items-center gap-3 rounded-xl py-2 transition hover:-translate-y-1"
          >
            <div className="relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full bg-[#fff5e8] transition group-hover:scale-110">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="76px"
                className="object-contain p-2"
              />
            </div>

            <span className="text-sm font-bold text-[#292521] transition group-hover:text-[#e6392e]">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
