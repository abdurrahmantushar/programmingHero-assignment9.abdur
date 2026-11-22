
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  Store,
  ShieldCheck,
  Crown,
  CalendarDays,
  Mail,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Filter,
  Ban,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

type UserRole = "admin" | "vendor" | "customer";

interface User {
  _id: string;
  name?: string;
  email?: string;
  role: UserRole;
  subscriptionPlan?: string;
  createdAt?: string;
  image?: string;
  isBlocked?: boolean;
}

interface Pagination {
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

const API_URL = "";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    totalUsers: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>("customer");
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (role !== "all") params.set("role", role);

      const response = await fetch(
        `${API_URL}/api/admin/users?${params.toString()}`,
        { credentials: "include", cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load users");
      }

      setUsers(result.data.users || []);
      setPagination(
        result.data.pagination || {
          totalUsers: 0,
          currentPage: 1,
          totalPages: 1,
          limit: 10,
        }
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser._id);

      const response = await fetch(
        `${API_URL}/api/admin/users/${selectedUser._id}/role`,
        { credentials: "include",
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update role");
      }

      setShowRoleModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update role"
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      setActionLoading(deleteUser._id);

      const response = await fetch(
        `${API_URL}/api/admin/users/${deleteUser._id}`,
        { credentials: "include", method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete user");
      }

      setDeleteUser(null);

      if (users.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchUsers();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete user"
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleBlockToggle = async () => {
    if (!blockTarget) return;

    const nextBlocked = !blockTarget.isBlocked;

    try {
      setActionLoading(blockTarget._id);

      const response = await fetch(
        `${API_URL}/api/admin/users/${blockTarget._id}/block`,
        {
          credentials: "include",
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isBlocked: nextBlocked }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update block status");
      }

      toast.success(
        result.message ||
          `User ${nextBlocked ? "blocked" : "unblocked"} successfully`
      );
      setBlockTarget(null);
      await fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update block status"
      );
    } finally {
      setActionLoading("");
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name?: string) => {
    return (name || "U")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getRoleStyle = (userRole: UserRole) => {
    switch (userRole) {
      case "admin":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "vendor":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
  };

  const vendorCount = users.filter((user) => user.role === "vendor").length;
  const customerCount = users.filter((user) => user.role === "customer").length;
  const adminCount = users.filter((user) => user.role === "admin").length;

  return (
    <div className="min-h-screen space-y-6 bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-600">
            Administration / Users
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Users Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all PizzaHub platform users.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={pagination.totalUsers}
          icon={<Users size={21} />}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Vendors"
          value={vendorCount}
          icon={<Store size={21} />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Customers"
          value={customerCount}
          icon={<UserRound size={21} />}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Admins"
          value={adminCount}
          icon={<ShieldCheck size={21} />}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              All Users
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {pagination.totalUsers} registered users
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm font-medium text-gray-700 outline-none focus:border-emerald-500 sm:w-40"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-5 flex flex-col items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchUsers}
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4 font-semibold">User</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Subscription</th>
                <th className="px-5 py-4 font-semibold">Joined Date</th>
                <th className="px-5 py-4 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2
                      size={28}
                      className="mx-auto animate-spin text-emerald-600"
                    />
                    <p className="mt-3 text-sm text-gray-500">
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Users
                      size={35}
                      className="mx-auto text-gray-300"
                    />
                    <p className="mt-3 font-semibold text-gray-700">
                      No users found
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="transition hover:bg-emerald-50/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                            {getInitials(user.name)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {user.name || "Unnamed User"}
                          </p>
                          <p className="flex items-center gap-1.5 truncate text-xs text-gray-500">
                            <Mail size={12} />
                            {user.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRoleStyle(user.role)}`}
                      >
                        {user.role === "admin" && (
                          <ShieldCheck size={13} />
                        )}
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                          user.isBlocked
                            ? "border-red-100 bg-red-50 text-red-700"
                            : "border-emerald-100 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {user.isBlocked ? (
                          <Ban size={13} />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {user.role === "vendor" &&
                      user.subscriptionPlan === "premium" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          <Crown size={13} />
                          Premium
                        </span>
                      ) : user.role === "vendor" ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          Free
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays size={15} className="text-gray-400" />
                        {formatDate(user.createdAt)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {user.role !== "admin" && (
                          <>
                            <button
                              onClick={() => openRoleModal(user)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <Pencil size={13} />
                              Role
                            </button>

                            <button
                              onClick={() => setDeleteUser(user)}
                              className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}

                        {(user.role !== "admin" ||
                          (currentUserId &&
                            String(user._id) !== String(currentUserId))) && (
                          <button
                            onClick={() => setBlockTarget(user)}
                            disabled={actionLoading === user._id}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                              user.isBlocked
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-red-100 text-red-600 hover:bg-red-50"
                            }`}
                          >
                            {user.isBlocked ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              <Ban size={13} />
                            )}
                            {user.isBlocked ? "Unblock" : "Block"}
                          </button>
                        )}

                        {user.role === "admin" &&
                          (!currentUserId ||
                            String(user._id) === String(currentUserId)) && (
                            <span className="text-xs font-medium text-gray-400">
                              Protected
                            </span>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {pagination.totalUsers === 0
                ? 0
                : (page - 1) * pagination.limit + 1}
              {" - "}
              {Math.min(page * pagination.limit, pagination.totalUsers)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {pagination.totalUsers}
            </span>{" "}
            users
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="px-3 text-sm font-medium text-gray-700">
              Page {page} of {Math.max(1, pagination.totalPages)}
            </span>

            <button
              onClick={() =>
                setPage((prev) =>
                  Math.min(pagination.totalPages, prev + 1)
                )
              }
              disabled={page >= pagination.totalPages || loading}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Change User Role
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Change the role for{" "}
              <span className="font-semibold text-gray-800">
                {selectedUser.name || selectedUser.email}
              </span>
              .
            </p>

            <div className="mt-5 space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Select new role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleUpdate}
                disabled={
                  actionLoading === selectedUser._id ||
                  newRole === selectedUser.role
                }
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading === selectedUser._id
                  ? "Updating..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-gray-900">
              Delete User?
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {deleteUser.name || deleteUser.email}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteUser(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading === deleteUser._id}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === deleteUser._id
                  ? "Deleting..."
                  : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {blockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                blockTarget.isBlocked
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {blockTarget.isBlocked ? (
                <CheckCircle2 size={22} />
              ) : (
                <Ban size={22} />
              )}
            </div>

            <h3 className="mt-4 text-lg font-bold text-gray-900">
              {blockTarget.isBlocked ? "Unblock User?" : "Block User?"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to{" "}
              <span className="font-semibold text-gray-800">
                {blockTarget.isBlocked ? "unblock" : "block"}
              </span>{" "}
              <span className="font-semibold text-gray-800">
                {blockTarget.name || blockTarget.email}
              </span>
              ?
              {!blockTarget.isBlocked &&
                " Blocked users cannot access protected areas of PizzaHub."}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setBlockTarget(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockToggle}
                disabled={actionLoading === blockTarget._id}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  blockTarget.isBlocked
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading === blockTarget._id
                  ? "Updating..."
                  : blockTarget.isBlocked
                    ? "Unblock User"
                    : "Block User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </h3>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
