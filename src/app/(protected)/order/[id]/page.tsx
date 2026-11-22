
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Pizza,
  ShoppingBag,
  MessageSquare,
  Minus,
  Plus,
  Home,
  BriefcaseBusiness,
  MapPinned,
  Phone,
  Star,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import MenuItemImage from "@/app/components/shared/MenuItemImage";
import { normalizeCategory } from "@/constants/categories";
import { authFetch } from "@/lib/auth-fetch";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface MenuItem {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  images: string[];
  location: string;
}

interface Address {
  _id: string;
  customerId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  label: string;
  isDefault: boolean;
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [id, setId] = useState("");
  const [pizza, setPizza] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [minDate, setMinDate] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [message, setMessage] = useState("");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  useEffect(() => {
    if (isPending || !id) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    const fetchPizza = async () => {
      try {
        const response = await authFetch(
          `${API_URL}/api/menu-items/${id}`,
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

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.id) {
      setAddressLoading(false);
      return;
    }

    const fetchAddresses = async () => {
      try {
        setAddressLoading(true);
        setAddressError("");

        const response = await authFetch(
          `/api/customer/${session.user.id}/addresses`
        , { credentials: "include" });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load addresses");
        }

        const savedAddresses: Address[] = result.data || [];

        setAddresses(savedAddresses);

        const defaultAddress = savedAddresses.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (savedAddresses.length > 0) {
          setSelectedAddressId(savedAddresses[0]._id);
        }
      } catch (error) {
        setAddressError(
          error instanceof Error
            ? error.message
            : "Failed to load saved addresses"
        );
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, [session?.user?.id, isPending]);

  useEffect(() => {
    const today = new Date();

    const formattedDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    setMinDate(formattedDate);
  }, []);

  const totalPrice = pizza ? pizza.price * quantity : 0;

  const selectedAddress = addresses.find(
    (address) => address._id === selectedAddressId
  );

  const getAddressIcon = (label: string) => {
    if (label === "Office") return BriefcaseBusiness;
    if (label === "Other") return MapPinned;
    return Home;
  };

  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!pizza || !session?.user?.id) return;

    if (!selectedAddress) {
      setError("Please select a delivery address.");
      return;
    }

    try {
      setOrderLoading(true);
      setError("");

      const deliveryAddress = `${selectedAddress.fullName}, ${selectedAddress.phone}, ${selectedAddress.address}, ${selectedAddress.area}, ${selectedAddress.city} - ${selectedAddress.postalCode}`;

      const response = await authFetch("/api/orders", { credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: pizza._id,
          customerId: session.user.id,
          quantity,
          deliveryDate,
          deliveryAddress,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to place order");
      }

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setOrderLoading(false);
    }
  };

  if (isPending || !id || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#fffaf3]">
        <LoaderCircle className="animate-spin text-[#e62e20]" size={36} />
      </div>
    );
  }

  if (!session) return null;

  if (error && !pizza) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#fffaf3] px-4">
        <h2 className="text-xl font-bold text-gray-800">{error}</h2>
        <Link
          href="/browse-menu"
          className="rounded-xl bg-[#e62e20] px-6 py-3 font-semibold text-white"
        >
          Back to Menu
        </Link>
      </div>
    );
  }

  if (!pizza) return null;

  if (success) {
    return (
      <section className="flex min-h-[75vh] items-center justify-center bg-[#fffaf3] px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 size={42} className="text-green-600" />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#292929]">
            Order Placed!
          </h1>

          <p className="mt-3 leading-7 text-gray-500">
            Your order has been placed successfully. You can track your order
            from your customer dashboard.
          </p>

          <Link
            href="/customer"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#e62e20] px-6 py-4 font-semibold text-white transition hover:bg-[#c92318]"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/browse-menu"
            className="mt-4 inline-block text-sm font-semibold text-gray-500 hover:text-[#e62e20]"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fffaf3] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/menu/${pizza._id}`}
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#e62e20]"
        >
          <ArrowLeft size={18} />
          Back to Pizza Details
        </Link>

        <div className="mb-9">
          <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#e62e20]">
            PizzaHub Checkout
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#292929] sm:text-4xl">
            Complete Your Order
          </h1>

          <p className="mt-2 text-gray-500">
            Just a few details and your delicious pizza will be on its way.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-5">
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="overflow-hidden rounded-3xl border border-[#eee5db] bg-white shadow-sm">
              <div className="relative aspect-[5/4] bg-gray-100">
                {pizza.images?.[0] && (
                  <MenuItemImage
                    images={pizza.images}
                    alt={pizza.itemName}
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                )}

                <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#e62e20] shadow-sm">
                  {normalizeCategory(pizza.category)}
                </span>
              </div>

              <div className="p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-widest text-[#e62e20]">
                  Your Selection
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#292929]">
                  {pizza.itemName}
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {pizza.description || "Freshly prepared and delicious."}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={17} className="text-[#e62e20]" />
                  {pizza.location}
                </div>

                <div className="my-6 border-t border-dashed border-[#eee5db]" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Price per pizza</span>
                  <span className="font-bold text-[#292929]">
                    ৳{pizza.price}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Quantity</span>
                  <span className="font-bold text-[#292929]">
                    {quantity}
                  </span>
                </div>

                <div className="my-6 border-t border-[#eee5db]" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#292929]">
                    Total Amount
                  </span>
                  <span className="text-3xl font-extrabold text-[#e62e20]">
                    ৳{totalPrice}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#f3e5d7] bg-[#fff3e5] p-5">
              <div className="flex items-start gap-3">
                <ShoppingBag className="mt-0.5 text-[#e62e20]" size={21} />
                <div>
                  <h3 className="font-bold text-[#292929]">
                    Made fresh for you
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Your order will be prepared by the restaurant after it is
                    accepted.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 rounded-3xl border border-[#eee5db] bg-white p-5 shadow-sm sm:p-8 lg:order-2 lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#292929]">
                Delivery Details
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Enter where and when you want your pizza delivered.
              </p>
            </div>

            <form onSubmit={handleOrder} className="space-y-7">
              <div>
                <label className="mb-3 block text-sm font-bold text-[#292929]">
                  Select Quantity
                </label>

                <div className="flex items-center justify-between rounded-2xl border border-[#eee5db] bg-[#fffaf3] p-4">
                  <div>
                    <p className="font-semibold text-[#292929]">
                      Number of pizzas
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      ৳{pizza.price} per pizza
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((previous) => Math.max(1, previous - 1))
                      }
                      disabled={quantity <= 1}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eee5db] bg-white text-[#292929] transition hover:border-[#e62e20] hover:text-[#e62e20] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={17} />
                    </button>

                    <span className="min-w-5 text-center text-lg font-bold text-[#292929]">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((previous) => previous + 1)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e62e20] text-white transition hover:bg-[#c92318]"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="deliveryDate"
                  className="mb-2 block text-sm font-bold text-[#292929]"
                >
                  Delivery Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e62e20]"
                  />
                  <input
                    id="deliveryDate"
                    type="date"
                    min={minDate}
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full rounded-xl border border-[#eee5db] bg-[#fffaf3] py-3.5 pl-12 pr-4 text-sm text-[#292929] outline-none transition focus:border-[#e62e20] focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <label className="text-sm font-bold text-[#292929]">
                    Select Delivery Address
                  </label>

                  <Link
                    href="/customer/addresses"
                    className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-[#e62e20] transition hover:text-[#c92318]"
                  >
                    <Plus size={16} />
                    Add New Address
                  </Link>
                </div>

                {addressLoading ? (
                  <div className="flex items-center justify-center rounded-xl border border-[#eee5db] bg-[#fffaf3] py-10">
                    <LoaderCircle
                      size={25}
                      className="animate-spin text-[#e62e20]"
                    />
                  </div>
                ) : addressError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {addressError}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#e9d7c7] bg-[#fffaf3] px-5 py-8 text-center">
                    <MapPin
                      size={32}
                      className="mx-auto text-[#e62e20]"
                    />
                    <h3 className="mt-3 font-bold text-[#292929]">
                      No Saved Address
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Add a delivery address before placing your order.
                    </p>
                    <Link
                      href="/customer/addresses"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#e62e20] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c92318]"
                    >
                      <Plus size={17} />
                      Add Your Address
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((address) => {
                      const AddressIcon = getAddressIcon(address.label);
                      const isSelected =
                        selectedAddressId === address._id;

                      return (
                        <button
                          key={address._id}
                          type="button"
                          onClick={() =>
                            setSelectedAddressId(address._id)
                          }
                          className={`relative rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-[#e62e20] bg-red-50/50 ring-2 ring-red-100"
                              : "border-[#eee5db] bg-white hover:border-orange-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                  isSelected
                                    ? "bg-red-100 text-[#e62e20]"
                                    : "bg-[#fff3e5] text-[#e62e20]"
                                }`}
                              >
                                <AddressIcon size={19} />
                              </div>
                              <div>
                                <p className="font-bold text-[#292929]">
                                  {address.label}
                                </p>
                                {address.isDefault && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#e62e20]">
                                    <Star size={10} fill="currentColor" />
                                    DEFAULT
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-[#e62e20] bg-[#e62e20] text-white"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle2 size={14} />
                              )}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-bold text-gray-800">
                              {address.fullName}
                            </p>

                            <p className="flex items-start gap-2 text-xs leading-5 text-gray-500">
                              <MapPin
                                size={14}
                                className="mt-0.5 shrink-0 text-[#e62e20]"
                              />
                              <span>
                                {address.address}, {address.area},{" "}
                                {address.city} - {address.postalCode}
                              </span>
                            </p>

                            <p className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone
                                size={13}
                                className="text-[#e62e20]"
                              />
                              {address.phone}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!addressLoading &&
                  addresses.length > 0 &&
                  !selectedAddress && (
                    <p className="mt-2 text-xs text-red-600">
                      Please select a delivery address.
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-bold text-[#292929]"
                >
                  Additional Message
                  <span className="ml-2 font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <div className="relative">
                  <MessageSquare
                    size={19}
                    className="absolute left-4 top-4 text-[#e62e20]"
                  />
                  <textarea
                    id="message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any special instructions for your order?"
                    className="w-full resize-none rounded-xl border border-[#eee5db] bg-[#fffaf3] py-3.5 pl-12 pr-4 text-sm text-[#292929] outline-none transition placeholder:text-gray-400 focus:border-[#e62e20] focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="rounded-2xl bg-[#fffaf3] p-5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Pizza price × {quantity}</span>
                  <span>৳{totalPrice}</span>
                </div>

                <div className="my-4 border-t border-dashed border-[#e5d9ca]" />

                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#292929]">
                    Total Amount
                  </span>
                  <span className="text-2xl font-extrabold text-[#e62e20]">
                    ৳{totalPrice}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  orderLoading ||
                  addressLoading ||
                  addresses.length === 0 ||
                  !selectedAddress
                }
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#e62e20] px-6 py-4 font-bold text-white shadow-lg shadow-red-100 transition hover:bg-[#c92318] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {orderLoading ? (
                  <>
                    <LoaderCircle size={20} className="animate-spin" />
                    Placing Your Order...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    Place Order · ৳{totalPrice}
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-gray-400">
                Your order will be sent to the restaurant for confirmation.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
