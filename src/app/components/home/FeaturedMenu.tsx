
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

const pizzas = [
  {
    name: "Farmhouse Delight",
    description: "Loaded with fresh veggies, olives, capsicum & grilled mushroom.",
    price: 550,
    badge: "BEST SELLER",
    badgeColor: "bg-[#e6392e]",
    image: "/images/pizzas/farmhouse-delight.png",
  },
  {
    name: "Chicken BBQ",
    description: "Grilled chicken, BBQ sauce, onions and mozzarella cheese.",
    price: 650,
    badge: "CHEF'S PICK",
    badgeColor: "bg-[#f59e0b]",
    image: "/images/pizzas/chicken-bbq.jpg",
  },
  {
    name: "Spicy Italian",
    description: "Pepperoni, spicy sausage, jalapenos & extra cheese.",
    price: 600,
    badge: "SPICY",
    badgeColor: "bg-[#e6392e]",
    image: "/images/pizzas/spicy-italian.jpg",
  },
  {
    name: "Margherita",
    description: "Classic delight with 100% real mozzarella & fresh basil.",
    price: 500,
    badge: "NEW",
    badgeColor: "bg-green-600",
    image: "/images/pizzas/margherita.jpg",
  },
];

export default function FeaturedMenu() {
  return (
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pizzas.map((pizza) => (
          <div
            key={pizza.name}
            className="group overflow-hidden rounded-xl border border-[#eee5db] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-[210px] overflow-hidden bg-[#fff2e5]">
              <Image
                src={pizza.image}
                alt={pizza.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-110"
              />

              <span
                className={`absolute left-3 top-3 rounded-full ${pizza.badgeColor} px-3 py-1.5 text-[10px] font-extrabold text-white`}
              >
                {pizza.badge}
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-base font-bold text-[#25211e]">
                {pizza.name}
              </h3>

              <p className="mt-2 min-h-[44px] text-xs leading-5 text-[#77716b]">
                {pizza.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-extrabold text-[#e6392e]">
                  ৳{pizza.price}
                </span>

                <Link
                  href="/browse-menu"
                  aria-label={`View ${pizza.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6392e] text-white shadow-md transition hover:scale-110 hover:bg-[#c9251a]"
                >
                  <Plus size={20} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
