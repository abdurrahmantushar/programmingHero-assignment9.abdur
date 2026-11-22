
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Package,
    Pizza,
    Receipt,
    ShoppingBag,
    XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { authFetch } from "@/lib/auth-fetch";

type Order = {
    _id: string;
    image: string;
    itemName: string;
    price: number;
    quantity: number;
    totalPrice: number;
    deliveryDate: string;
    deliveryAddress: string;
    message: string;
    status: string;
    createdAt: string;
};

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

const statusStyles: Record<string, string> = {
    pending: "bg-orange-50 text-orange-600",
    accepted: "bg-blue-50 text-blue-600",
    rejected: "bg-red-50 text-red-600",
    cancelled: "bg-gray-100 text-gray-600",
};

export default function OrderDetailsPage() {
    const params = useParams<{ id: string }>();
    const { data: session, isPending } = authClient.useSession();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const prefersReducedMotion = useReducedMotion() ?? false;

    const pageFade: Variants = {
        hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 },
        show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" } },
    };
    const stagger: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08, delayChildren: prefersReducedMotion ? 0 : 0.05 } },
    };
    const itemFade: Variants = {
        hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 },
        show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" } },
    };

    useEffect(() => {
        if (isPending) return;

        if (!session?.user?.id || !params.id) {
            setLoading(false);
            setError("Unable to identify your order.");
            return;
        }

        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await authFetch(
                    `/api/customer/${session.user.id}/orders/${params.id}`
                , { credentials: "include" });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to fetch order");
                }

                setOrder(result.data);
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

        fetchOrder();
    }, [session?.user?.id, isPending, params.id]);

    if (loading || isPending) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#e62e20]" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-10 text-center">
                <XCircle size={45} className="mx-auto text-red-500" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                    Order Not Found
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    {error || "We couldn't find this order."}
                </p>
                <Link prefetch={false}
                    href="/customer/orders"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e62e20] px-5 py-3 text-sm font-bold text-white hover:bg-[#c92318]"
                >
                    <ArrowLeft size={17} />
                    Back to My Orders
                </Link>
            </div>
        );
    }

    const timeline = [
        {
            label: "Order Placed",
            description: "Your order has been submitted successfully.",
            icon: ShoppingBag,
            completed: true,
        },
        {
            label: "Order Accepted",
            description: "The restaurant has accepted your order.",
            icon: CheckCircle2,
            completed: order.status === "accepted",
        },
        {
            label:
                order.status === "rejected"
                    ? "Order Rejected"
                    : order.status === "cancelled"
                        ? "Order Cancelled"
                        : "Order Processing",
            description:
                order.status === "rejected"
                    ? "The restaurant rejected your order."
                    : order.status === "cancelled"
                        ? "This order has been cancelled."
                        : order.status === "accepted"
                            ? "Your order has been accepted."
                            : "Waiting for restaurant confirmation.",
            icon:
                order.status === "rejected" || order.status === "cancelled"
                    ? XCircle
                    : Clock3,
            completed:
                order.status === "rejected" || order.status === "cancelled",
        },
    ];

    const MotionLink = motion.create(Link);

    return (
        <motion.div
            className="mx-auto max-w-6xl space-y-7"
            variants={pageFade}
            initial="hidden"
            animate="show"
        >
            <div>
                <Link prefetch={false}
                    href="/customer/orders"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#e62e20]"
                >
                    <ArrowLeft size={17} />
                    Back to My Orders
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold text-[#e62e20]">
                            CUSTOMER DASHBOARD
                        </p>
                        <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                            Order Details
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Order #{order._id}
                        </p>
                    </div>

                    <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${statusStyles[order.status] || "bg-gray-100 text-gray-600"
                            }`}
                    >
                        {order.status}
                    </span>

                    <Link prefetch={false}
                        href={`/customer/tracking/${order._id}`}
                        className="mt-3 flex w-fit items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 text-sm font-bold text-[#e62e20] transition hover:bg-orange-50"
                    >
                        <Package size={17} />
                        Track Order
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <motion.section
                        variants={itemFade}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.15 }}
                        className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3 border-b border-orange-100 pb-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                                <Pizza size={25} className="text-[#e62e20]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">
                                    Ordered Item
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Your pizza order information
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between gap-5 pt-5 sm:flex-row sm:items-center">
                            <div>
                                <Image
                                    src={order.image}
                                    alt={order.itemName}
                                    width={100}
                                    height={100}
                                    className="rounded-xl"
                                />
                                <h3 className="text-xl font-extrabold text-gray-900">
                                    {order.itemName}
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Quantity: {order.quantity}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Price per item: ৳{order.price}
                                </p>
                            </div>

                            <div className="rounded-xl bg-[#fffaf5] px-5 py-4">
                                <p className="text-xs text-gray-500">Total Amount</p>
                                <p className="mt-1 text-2xl font-extrabold text-[#e62e20]">
                                    ৳{order.totalPrice}
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        variants={itemFade}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.15 }}
                        className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="text-lg font-extrabold text-gray-900">
                            Order Timeline
                        </h2>

                        <div className="mt-6 space-y-6">
                            {timeline.map((step, index) => {
                                const Icon = step.icon;

                                return (
                                    <div key={step.label} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full ${step.completed
                                                        ? "bg-green-50 text-green-600"
                                                        : "bg-gray-100 text-gray-400"
                                                    }`}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            {index !== timeline.length - 1 && (
                                                <div className="mt-2 h-8 w-0.5 bg-orange-100" />
                                            )}
                                        </div>

                                        <div className="pt-1">
                                            <h3 className="font-bold text-gray-900">
                                                {step.label}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.section>

                    <motion.section
                        variants={itemFade}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.15 }}
                        className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="text-lg font-extrabold text-gray-900">
                            Delivery Information
                        </h2>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="flex gap-3">
                                <CalendarDays className="shrink-0 text-[#e62e20]" size={21} />
                                <div>
                                    <p className="text-xs text-gray-400">Order Date</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Package className="shrink-0 text-[#e62e20]" size={21} />
                                <div>
                                    <p className="text-xs text-gray-400">Delivery Date</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                        {formatDate(order.deliveryDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:col-span-2">
                                <MapPin className="shrink-0 text-[#e62e20]" size={21} />
                                <div>
                                    <p className="text-xs text-gray-400">Delivery Address</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                        {order.deliveryAddress}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {order.message && (
                            <div className="mt-5 rounded-xl bg-[#fffaf5] p-4">
                                <p className="text-xs font-semibold text-gray-400">
                                    Additional Message
                                </p>
                                <p className="mt-2 text-sm text-gray-700">
                                    {order.message}
                                </p>
                            </div>
                        )}
                    </motion.section>
                </div>

                <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                        <Receipt size={22} className="text-[#e62e20]" />
                        <h2 className="text-lg font-extrabold text-gray-900">
                            Order Summary
                        </h2>
                    </div>

                    <div className="mt-6 space-y-4 text-sm">
                        <div className="flex justify-between gap-3 text-gray-500">
                            <span>Item Price</span>
                            <span>৳{order.price}</span>
                        </div>
                        <div className="flex justify-between gap-3 text-gray-500">
                            <span>Quantity</span>
                            <span>× {order.quantity}</span>
                        </div>
                        <div className="border-t border-dashed border-orange-200 pt-4">
                            <div className="flex justify-between gap-3 font-extrabold text-gray-900">
                                <span>Total</span>
                                <span className="text-[#e62e20]">
                                    ৳{order.totalPrice}
                                </span>
                            </div>
                        </div>
                    </div>

                    {order.status === "pending" && (
                        <div className="mt-6 rounded-xl bg-orange-50 p-4">
                            <p className="text-sm font-semibold text-orange-700">
                                Your order is waiting for restaurant confirmation.
                            </p>
                        </div>
                    )}

                    <MotionLink prefetch={false}
                        href="/customer/orders"
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#c92318]"
                    >
                        <ArrowLeft size={17} />
                        Back to My Orders
                    </MotionLink>
                </aside>
            </div>
        </motion.div>
    );
}
