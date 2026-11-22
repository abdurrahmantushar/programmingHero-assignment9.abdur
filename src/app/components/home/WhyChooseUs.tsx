
"use client";

import {
  Bike,
  Award,
  ShieldCheck,
  Headset,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const features = [
  {
    icon: Bike,
    title: "Fast Delivery",
    description: "Get your favorite pizza delivered fresh and hot to your doorstep.",
  },
  {
    icon: Award,
    title: "Best Quality",
    description: "We use premium ingredients to make every bite delicious.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Enjoy safe and secure payment options for every order.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description: "Our friendly support team is always here to help you.",
  },
];

export default function WhyChooseUs() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const card: Variants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 24,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: "easeOut",
      },
    },
  };

  const iconScale: Variants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      scale: prefersReducedMotion ? 1 : 0.82,
    },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full bg-[#991B1B] py-16 sm:py-20">
      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <motion.div
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={card}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                className="group flex flex-col items-center text-center"
              >
                <motion.div
                  variants={iconScale}
                  className="mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-2xl border border-white/25 bg-white/10 transition-all duration-300 group-hover:bg-white/20"
                >
                  <Icon
                    size={36}
                    strokeWidth={1.7}
                    className="text-white"
                  />
                </motion.div>

                <h3 className="mb-3 text-xl font-bold text-white">
                  {feature.title}
                </h3>

                <p className="max-w-[260px] text-sm leading-7 text-white/75">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
