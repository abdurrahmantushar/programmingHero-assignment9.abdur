
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
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

const MotionLink = motion.create(Link);

export default function CategorySection() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
  };

  const card: Variants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 18,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative z-20 mx-auto -mt-12 max-w-[1440px] px-5 sm:px-8 lg:px-12">
      <motion.div
        className="grid grid-cols-2 gap-5 rounded-2xl border border-[#f0ebe5] bg-white px-5 py-7 shadow-lg shadow-black/10 sm:grid-cols-3 lg:grid-cols-6 lg:px-8"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {categories.map((category) => (
          <MotionLink
            href="/browse-menu"
            key={category.name}
            variants={card}
            whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.03 }}
            className="group flex flex-col items-center gap-3 rounded-xl py-2 transition-shadow"
          >
            <div className="relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full bg-[#fff5e8] transition duration-300 group-hover:scale-110">
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
          </MotionLink>
        ))}
      </motion.div>
    </section>
  );
}
