"use client";

import { useCallback, useEffect, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    DollarSign,
    Receipt,
    RefreshCw,
    Search,
    X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Transaction {
    _id: string;
    vendorId: string;
    vendorName: string;
    vendorEmail: string;
    sessionId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const formatAmount = (amount?: number, currency?: string) => {
    const value = Number(amount) || 0;

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency?.toUpperCase() || "USD",
    }).format(value / 100);
};

const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getInitials = (name?: string) => {
    if (!name) return "?";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

const statusStyles = (status: string) => {
    if (status === "paid") {
        return {
            badge: "bg-green-50 text-green-700",
            dot: "bg-green-500",
        };
    }

    if (status === "pending") {
        return {
            badge: "bg-orange-50 text-orange-700",
            dot: "bg-orange-500",
        };
    }

    return {
        badge: "bg-red-50 text-red-700",
        dot: "bg-red-500",
    };
};

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [totalRevenue, setTotalRevenue] = useState(0);

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                search,
                page: String(pagination.page),
                limit: String(pagination.limit),
            });

            const response = await fetch(
                `${API_URL}/api/admin/transactions?${params}`,
                { cache: "no-store" }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to fetch transactions"
                );
            }

            setTransactions(result.data || []);
            setTotalRevenue(Number(result.totalRevenue) || 0);
            setPagination((prev) => ({
                ...prev,
                ...result.pagination,
            }));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load transactions"
            );
        } finally {
            setLoading(false);
        }
    }, [search, pagination.page, pagination.limit]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTransactions();
        }, 300);

        return () => clearTimeout(timeout);
    }, [fetchTransactions]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const paidTransactions = transactions.filter(
        (transaction) => transaction.status === "paid"
    ).length;

    const currency = transactions[0]?.currency || "usd";

    const summaryCards = [
        {
            label: "Total Transactions",
            value: pagination.total.toLocaleString(),
            hint: "All subscription payments",
            icon: CreditCard,
            tone: "bg-orange-50 text-[#e62e20]",
        },
        {
            label: "Paid on This Page",
            value: paidTransactions.toLocaleString(),
            hint: `Of ${transactions.length} shown`,
            icon: CheckCircle2,
            tone: "bg-blue-50 text-blue-600",
        },
        {
            label: "Total Revenue",
            value: formatAmount(totalRevenue, currency),
            hint: "All paid subscriptions",
            icon: DollarSign,
            tone: "bg-green-50 text-green-600",
        },
    ];

    const showingFrom =
        transactions.length > 0
            ? (pagination.page - 1) * pagination.limit + 1
            : 0;
    const showingTo =
        (pagination.page - 1) * pagination.limit + transactions.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e62e20] text-white shadow-sm">
                        <Receipt size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">
                            Transactions
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage and monitor vendor premium subscription
                            payments.
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchTransactions}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-bold text-[#e62e20] transition hover:bg-orange-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">
                                        {card.label}
                                    </p>
                                    <h2 className="mt-2 truncate text-2xl font-extrabold text-gray-900">
                                        {card.value}
                                    </h2>
                                </div>
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
                                >
                                    <Icon size={22} />
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-gray-400">
                                {card.hint}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-extrabold text-gray-900">
                            All Transactions
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Premium subscription payment history
                        </p>
                    </div>

                    <div className="relative w-full sm:max-w-sm">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search vendor or session..."
                            className="w-full rounded-xl border border-orange-100 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#e62e20] focus:ring-2 focus:ring-orange-100"
                        />
                        {search && (
                            <button
                                onClick={() => handleSearch("")}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#e62e20]"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between">
                        <span>{error}</span>
                        <button
                            onClick={fetchTransactions}
                            className="font-bold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="mt-5 overflow-x-auto rounded-xl border border-orange-100">
                    <table className="w-full min-w-[860px] text-left text-sm">
                        <thead className="bg-orange-50/60">
                            <tr className="text-xs uppercase tracking-wider text-gray-500">
                                <th className="px-4 py-4 font-bold">Vendor</th>
                                <th className="px-4 py-4 font-bold">
                                    Session ID
                                </th>
                                <th className="px-4 py-4 font-bold">Amount</th>
                                <th className="px-4 py-4 font-bold">Date</th>
                                <th className="px-4 py-4 font-bold">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-orange-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-16 text-center">
                                        <RefreshCw
                                            className="mx-auto animate-spin text-[#e62e20]"
                                            size={24}
                                        />
                                        <p className="mt-3 text-sm text-gray-500">
                                            Loading transactions...
                                        </p>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#e62e20]">
                                            <CreditCard size={22} />
                                        </div>
                                        <p className="mt-3 font-bold text-gray-700">
                                            No transactions found
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Subscription payments will appear
                                            here.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => {
                                    const status = statusStyles(
                                        transaction.status
                                    );

                                    return (
                                        <tr
                                            key={transaction._id}
                                            className="transition hover:bg-orange-50/40"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-[#e62e20]">
                                                        {getInitials(
                                                            transaction.vendorName
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-gray-900">
                                                            {transaction.vendorName ||
                                                                "Unknown Vendor"}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-xs text-gray-500">
                                                            {transaction.vendorEmail}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-[11px] text-gray-400">
                                                            ID:{" "}
                                                            {transaction.vendorId}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p
                                                    title={transaction.sessionId}
                                                    className="max-w-[180px] truncate font-mono text-xs text-gray-600"
                                                >
                                                    {transaction.sessionId}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="font-bold text-gray-900">
                                                    {formatAmount(
                                                        transaction.amount,
                                                        transaction.currency
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Premium Subscription
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <CalendarDays
                                                        size={15}
                                                        className="text-gray-400"
                                                    />
                                                    {formatDate(
                                                        transaction.createdAt
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${status.badge}`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                                    />
                                                    {transaction.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-orange-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-semibold text-gray-700">
                            {showingFrom}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-gray-700">
                            {showingTo}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-700">
                            {pagination.total}
                        </span>{" "}
                        transactions
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.page <= 1 || loading}
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: prev.page - 1,
                                }))
                            }
                            className="flex items-center gap-1 rounded-lg border border-orange-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-orange-50 hover:text-[#e62e20] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ArrowLeft size={15} />
                            Previous
                        </button>

                        <span className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-[#e62e20]">
                            {pagination.page} /{" "}
                            {Math.max(1, pagination.totalPages)}
                        </span>

                        <button
                            disabled={
                                pagination.page >= pagination.totalPages ||
                                loading
                            }
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: prev.page + 1,
                                }))
                            }
                            className="flex items-center gap-1 rounded-lg border border-orange-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-orange-50 hover:text-[#e62e20] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
