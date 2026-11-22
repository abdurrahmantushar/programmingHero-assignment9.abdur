
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Pizza,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Order = {
  _id: string;
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

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, isPending } = authClient.useSession();

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => setOrderId(id));
  }, [params]);

  useEffect(() => {
    if (isPending || !orderId) return;

    if (!session?.user?.id) {
      setError("Please sign in to track your order.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/customer/${session.user.id}/orders/${orderId}`
        , { credentials: "include" });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load tracking details.");
        }

        setOrder(result.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [session?.user?.id, isPending, orderId]);

  if (loading || isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#e62e20]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center">
        <Package size={45} className="mx-auto text-gray-300" />
        <h2 className="mt-4 text-xl font-extrabold text-gray-900">
          Tracking Information Unavailable
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {error || "We couldn't find this order."}
        </p>
        <Link
          href="/customer/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e62e20] px-5 py-3 text-sm font-bold text-white hover:bg-[#c92318]"
        >
          <ArrowLeft size={17} />
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isRejected = order.status === "rejected";
  const isCancelled = order.status === "cancelled";
  const isAccepted = order.status === "accepted";
  const isOrderPending = order.status === "pending";
  const isStopped = isRejected || isCancelled;

  const timeline = [
    {
      title: "Order Placed",
      description: "Your order has been successfully placed.",
      icon: ShoppingBag,
      completed: true,
    },
    {
      title: isRejected
        ? "Order Rejected"
        : isCancelled
          ? "Order Cancelled"
          : isAccepted
            ? "Order Accepted"
            : "Waiting for Confirmation",
      description: isRejected
        ? "The restaurant could not accept your order."
        : isCancelled
          ? "This order has been cancelled."
          : isAccepted
            ? "The restaurant has confirmed your order."
            : "Waiting for the restaurant to respond.",
      icon: isStopped ? XCircle : isAccepted ? CheckCircle2 : Clock3,
      completed: !isOrderPending,
    },
    {
      title: "Preparing Your Pizza",
      description: "The restaurant will prepare your pizza after confirmation.",
      icon: Pizza,
      completed: false,
      future: true,
    },
    {
      title: "Out for Delivery",
      description: "Your pizza will be handed over for delivery.",
      icon: Truck,
      completed: false,
      future: true,
    },
    {
      title: "Delivered",
      description: "Your pizza will be delivered to your address.",
      icon: CheckCircle2,
      completed: false,
      future: true,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div>
        <Link
          href={`/customer/orders/${order._id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#e62e20]"
        >
          <ArrowLeft size={17} />
          Back to Order Details
        </Link>

        <div className="mt-5">
          <p className="text-sm font-semibold text-[#e62e20]">
            CUSTOMER DASHBOARD
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Follow your order status and delivery information.
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-[#e62e20] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-white/80">
              ORDER TRACKING
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">
              #{order._id.slice(-8)}
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="w-fit rounded-xl bg-white/15 px-5 py-3">
            <p className="text-xs font-medium text-white/80">
              CURRENT STATUS
            </p>
            <p className="mt-1 text-lg font-extrabold capitalize">
              {order.status}
            </p>
          </div>
        </div>
      </section>

      {isOrderPending && (
        <div className="flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <Clock3 className="shrink-0 text-orange-600" size={22} />
          <div>
            <h3 className="font-bold text-orange-800">
              Waiting for Restaurant Confirmation
            </h3>
            <p className="mt-1 text-sm text-orange-700">
              Your order has been placed. The restaurant will review and
              respond to your order.
            </p>
          </div>
        </div>
      )}

      {isAccepted && (
        <div className="flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="shrink-0 text-green-600" size={22} />
          <div>
            <h3 className="font-bold text-green-800">
              Your Order Has Been Accepted!
            </h3>
            <p className="mt-1 text-sm text-green-700">
              The restaurant confirmed your order. Further preparation
              and delivery updates are not available yet.
            </p>
          </div>
        </div>
      )}

      {isStopped && (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <XCircle className="shrink-0 text-red-600" size={22} />
          <div>
            <h3 className="font-bold text-red-800">
              Order {order.status}
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {isRejected
                ? "The restaurant rejected this order."
                : "This order was cancelled."}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Delivery Progress
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your order journey from restaurant to doorstep.
            </p>
          </div>

          <div className="mt-8 space-y-0">
            {timeline.map((step, index) => {
              const Icon = step.icon;

              const active = step.completed;
              const isLast = index === timeline.length - 1;

              return (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        active
                          ? isStopped && index === 1
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    {!isLast && (
                      <div
                        className={`my-2 min-h-12 w-0.5 ${
                          active ? "bg-green-200" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>

                  <div className="flex-1 pb-7 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`font-bold ${
                          active ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </h3>

                      {active && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            isStopped && index === 1
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          Completed
                        </span>
                      )}

                      {step.future && !isStopped && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {step.description}
                    </p>

                    {step.future && (
                      <p className="mt-1 text-xs text-gray-400">
                        Estimated stage — live update not available.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin size={22} className="text-[#e62e20]" />
              <h2 className="font-extrabold text-gray-900">
                Delivery Details
              </h2>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-400">
                DELIVERY ADDRESS
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-gray-800">
                {order.deliveryAddress}
              </p>
            </div>

            <div className="mt-5 border-t border-orange-100 pt-5">
              <div className="flex items-center gap-3">
                <CalendarDays size={20} className="text-[#e62e20]" />
                <div>
                  <p className="text-xs text-gray-400">Delivery Date</p>
                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {formatDate(order.deliveryDate)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Package size={22} className="text-[#e62e20]" />
              <h2 className="font-extrabold text-gray-900">
                Order Summary
              </h2>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                <Pizza size={28} className="text-[#e62e20]" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-gray-900">
                  {order.itemName}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Quantity: {order.quantity}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-orange-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Price</span>
                <span>৳{order.price}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Quantity</span>
                <span>× {order.quantity}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-orange-200 pt-4 font-extrabold text-gray-900">
                <span>Total</span>
                <span className="text-[#e62e20]">
                  ৳{order.totalPrice}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Link
        href={`/customer/orders/${order._id}`}
        className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-[#e62e20] transition hover:bg-orange-50"
      >
        <ArrowLeft size={17} />
        Back to Order Details
      </Link>
    </div>
  );
}
