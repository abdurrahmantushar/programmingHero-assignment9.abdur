
"use client";

import Link from "next/link";
import { ArrowRight, Play, Star } from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export default function HeroSection() {
    const prefersReducedMotion = useReducedMotion() ?? false;

    const fadeUp: Variants = {
        hidden: {
            opacity: prefersReducedMotion ? 1 : 0,
            y: prefersReducedMotion ? 0 : 20,
        },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: prefersReducedMotion ? 0 : 0.55,
                ease: "easeOut",
            },
        },
    };

    const stagger: Variants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.12,
                delayChildren: prefersReducedMotion ? 0 : 0.05,
            },
        },
    };

    const imageReveal: Variants = {
        hidden: {
            opacity: prefersReducedMotion ? 1 : 0,
            y: prefersReducedMotion ? 0 : 16,
            scale: prefersReducedMotion ? 1 : 0.98,
        },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: prefersReducedMotion ? 0 : 0.7,
                ease: "easeOut",
                delay: prefersReducedMotion ? 0 : 0.15,
            },
        },
    };

    return (
        <section className="relative overflow-hidden bg-[#fff7eb]">
            <div className="mx-auto grid min-h-[510px] max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-20">
                <motion.div
                    className="relative z-10"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div
                        variants={fadeUp}
                        className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#e6392e] shadow-sm"
                    >
                        🔥 HOT & DELICIOUS
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        className="max-w-[600px] text-4xl font-extrabold leading-tight tracking-tight text-[#25211e] sm:text-5xl lg:text-[56px]"
                    >
                        Craving Pizza?
                        <br />
                        You’re in the{" "}
                        <span className="text-[#e6392e]">Right Place!</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        className="mt-6 max-w-[500px] text-base leading-8 text-[#625b54] sm:text-lg"
                    >
                        Discover the best local pizza restaurants, explore mouth-watering
                        menu and get it delivered hot & fresh.
                    </motion.p>

                    <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
                        <Link
                            href="/browse-menu"
                            className="inline-flex items-center gap-3 rounded-lg bg-[#e62e20] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-red-200 transition hover:-translate-y-1 hover:bg-[#c9251a]"
                        >
                            Explore Menu
                            <ArrowRight size={18} />
                        </Link>

                        <Link
                            href="/#how-it-works"
                            className="inline-flex items-center gap-3 rounded-lg border border-[#e62e20] bg-white/60 px-6 py-3.5 text-sm font-bold text-[#e62e20] transition hover:-translate-y-1 hover:bg-white"
                        >
                            How It Works
                            <Play size={17} fill="currentColor" />
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="mt-9 flex flex-wrap items-center gap-4"
                    >
                        <div className="flex -space-x-3">
                            {["👨🏻", "👩🏻", "👨🏽"].map((person, index) => (
                                <div
                                    key={index}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#f6dfc8] text-xl"
                                >
                                    {person}
                                </div>
                            ))}
                        </div>

                        <div>
                            <p className="text-sm text-[#514b45]">
                                Loved by 10K+ pizza lovers
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                                <div className="flex text-[#ffad0a]">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Star
                                            key={index}
                                            size={15}
                                            fill="currentColor"
                                            strokeWidth={0}
                                        />
                                    ))}
                                </div>

                                <span className="font-bold text-[#25211e]">4.8</span>
                                <span className="text-[#e6392e]">(2K+ Reviews)</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="relative flex min-h-[320px] items-center justify-center lg:min-h-[440px]">
                    <div className="absolute h-[300px] w-[300px] rounded-full bg-[#ffe1bd] blur-3xl sm:h-[400px] sm:w-[400px]" />

                    <div className="relative flex h-[300px] w-full max-w-[520px] items-center justify-center sm:h-[420px]">

                        <motion.div
                            variants={imageReveal}
                            initial="hidden"
                            animate="show"
                            className="relative flex min-h-[320px] items-center justify-center lg:min-h-[440px]"
                        >
                            <Image
                                src="/images/pizzas/hero-pizza.png"
                                alt="Freshly baked PizzaHub special pizza"
                                width={700}
                                height={600}
                                priority
                                className="relative z-10 h-auto w-full max-w-[650px] object-contain drop-shadow-2xl"
                            />
                        </motion.div>

                        <div className="absolute bottom-5 left-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#e6392e] shadow-lg">
                            ❤️ Made with Love
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
