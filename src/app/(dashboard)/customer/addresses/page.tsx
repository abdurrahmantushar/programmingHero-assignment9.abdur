
"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Home,
  BriefcaseBusiness,
  MapPinned,
  Phone,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Star,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Address = {
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
};

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  area: "",
  postalCode: "",
  label: "Home",
  isDefault: false,
};

export default function CustomerAddressesPage() {
  const { data: session, isPending } = authClient.useSession();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<Address | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const customerId = session?.user?.id;

  const fetchAddresses = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/customer/${customerId}/addresses`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load addresses");
      }

      setAddresses(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchAddresses();
    } else if (!isPending) {
      setLoading(false);
    }
  }, [customerId, isPending]);

  const openAddModal = () => {
    setEditingAddress(null);
    setForm(initialForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      area: address.area,
      postalCode: address.postalCode,
      label: address.label,
      isDefault: address.isDefault,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!customerId) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingAddress
        ? `${API_URL}/api/customer/${customerId}/addresses/${editingAddress._id}`
        : `${API_URL}/api/customer/${customerId}/addresses`;

      const response = await fetch(url, {
        method: editingAddress ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save address");
      }

      setShowModal(false);
      setEditingAddress(null);
      setForm(initialForm);
      setSuccess(
        editingAddress
          ? "Address updated successfully"
          : "Address added successfully"
      );

      await fetchAddresses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!customerId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(addressId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/customer/${customerId}/addresses/${addressId}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete address");
      }

      setSuccess("Address deleted successfully");
      await fetchAddresses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getAddressIcon = (label: string) => {
    if (label === "Office") return BriefcaseBusiness;
    if (label === "Other") return MapPinned;
    return Home;
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center">
        <p className="text-gray-600">Please sign in to view your addresses.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-600">
            <MapPin size={17} />
            Delivery Information
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            My Addresses
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your delivery addresses for a faster checkout.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          <Plus size={19} />
          Add New Address
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {success}
          <button
            onClick={() => setSuccess("")}
            className="ml-auto"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && !showModal && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
            <MapPinned size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              Saved Locations
            </h2>
            <p className="text-sm text-gray-500">
              {addresses.length} saved{" "}
              {addresses.length === 1 ? "address" : "addresses"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600">
          Easy Checkout
        </span>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-red-500">
            <MapPin size={30} />
          </div>
          <h3 className="mt-5 text-lg font-bold text-gray-900">
            No addresses saved yet
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Add your delivery address to make ordering your favorite pizza
            easier and faster.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Plus size={18} />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {addresses.map((item) => {
            const AddressIcon = getAddressIcon(item.label);

            return (
              <div
                key={item._id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                  item.isDefault
                    ? "border-red-200 ring-1 ring-red-100"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-red-600">
                      <AddressIcon size={22} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                          {item.label}
                        </h3>
                        {item.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                            <Star size={11} fill="currentColor" />
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Delivery Address
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <p className="font-semibold text-gray-900">
                    {item.fullName}
                  </p>

                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                    <span>
                      {item.address}, {item.area}, {item.city} -{" "}
                      {item.postalCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-red-500" />
                    {item.phone}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => openEditModal(item)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingId === item._id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Keep your delivery details updated
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Make sure your phone number and address are correct so your
              PizzaHub orders can reach you without any trouble.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your delivery information below.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Street / House Address
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="House number, road, building..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    City
                  </label>
                  <input
                    required
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    placeholder="e.g. Chattogram"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Area
                  </label>
                  <input
                    required
                    value={form.area}
                    onChange={(e) =>
                      setForm({ ...form, area: e.target.value })
                    }
                    placeholder="e.g. Panchlaish"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Postal Code
                  </label>
                  <input
                    required
                    value={form.postalCode}
                    onChange={(e) =>
                      setForm({ ...form, postalCode: e.target.value })
                    }
                    placeholder="e.g. 4203"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Address Type
                  </label>
                  <select
                    value={form.label}
                    onChange={(e) =>
                      setForm({ ...form, label: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-red-200">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 accent-red-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Set as my default delivery address
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 size={17} className="animate-spin" />
                  )}
                  {editingAddress ? "Save Changes" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
