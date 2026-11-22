
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  UserRound,
  Lock,
  Palette,
  Save,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function CustomerSettingsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const pageFade: Variants = { hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }, show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" } } };
  const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08, delayChildren: prefersReducedMotion ? 0 : 0.05 } } };
  const itemFade: Variants = { hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" } } };


  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
    }
  }, [session]);



  const handleProfileUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (name.trim() === session?.user?.name) {
      toast.info("No changes to update");
      return;
    }

    try {
      setSavingProfile(true);

      const result = await authClient.updateUser({
        name: name.trim(),
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different");
      return;
    }

    try {
      setChangingPassword(true);

      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setChangingPassword(false);
    }
  };

 

  const inputClass =
    "w-full rounded-xl border border-[#eee5db] bg-[#fffaf3] px-4 py-3 text-sm text-[#292929] outline-none transition placeholder:text-gray-400 focus:border-[#e62e20] focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-red-900";

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <motion.div className="min-h-screen bg-[#fffaf3] px-4 py-8  sm:px-6 lg:px-8" variants={pageFade} initial="hidden" animate="show">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#e62e20]">
            Account Preferences
          </p>

          <h1 className="text-3xl font-bold text-[#292929]  sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-900">
            Manage your personal information and account preferences.
          </p>
        </div>

        <div className="space-y-7">
          <motion.section variants={itemFade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.12 }} className="rounded-2xl border border-[#f1e5d9] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#e62e20] dark:bg-red-950">
                <UserRound size={23} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#292929] dark:text-white">
                  Profile Information
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update your personal details.
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>

                <input
                  type="email"
                  value={session.user.email || ""}
                  readOnly
                  className={`${inputClass} cursor-not-allowed opacity-70`}
                />

                <p className="mt-2 text-xs text-gray-400">
                  Email address cannot be changed from this page.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c92318] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.section>

          <motion.section variants={itemFade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.12 }} className="rounded-2xl border border-[#f1e5d9] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#e62e20] dark:bg-red-950">
                <Lock size={23} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#292929] dark:text-white">
                  Change Password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Keep your account secure with a strong password.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Current Password
                </label>

                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    placeholder="Enter current password"
                    className={`${inputClass} pr-12`}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label="Toggle current password visibility"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Enter new password"
                    className={`${inputClass} pr-12`}
                    required
                    minLength={6}
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm new password"
                    className={`${inputClass} pr-12`}
                    required
                    minLength={6}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-[#fffaf3] p-4 dark:bg-gray-800">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600"
                />
                <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Choose a password that is at least 6 characters long.
                  Never share your password with anyone.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#e62e20] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c92318] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Lock size={17} />
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </motion.section>


        </div>
      </div>
    </motion.div>
  );
}

