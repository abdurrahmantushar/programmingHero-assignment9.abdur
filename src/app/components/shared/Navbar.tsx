
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  CircleUserRound,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "./ThemeToggle";
import toast from "react-hot-toast";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Menu", href: "/browse-menu" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLElement>(null);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const avatarSrc = user?.image?.trim() || null;
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Unable to logout.");
        return;
      }

      toast.success("Logged out successfully");
      setIsOpen(false);
      setProfileMenuOpen(false);
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Unable to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/#how-it-works") return false;
    return pathname === href;
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const dashboardUrl =
    session?.user?.role === "admin"
      ? "/admin"
      : session?.user?.role === "vendor"
        ? "/vendor"
        : "/customer";
  return (
    <header
      ref={profileMenuRef}
      className="sticky top-0 z-50 w-full border-b border-[#eee5db] bg-white"
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-1">
          <Image
            src="/images/categories/allPizza.png"
            alt="PizzaHub Logo"
            width={40}
            height={40}
          />

          <span className="text-[25px] font-extrabold tracking-tight text-[#24211f]">
            Pizza<span className="text-[#e62e20]">Hub</span>
          </span>
        </Link>

        <nav className="hidden h-full items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative flex h-full items-center text-[14px] font-semibold transition-colors ${isActive(link.href)
                ? "text-[#e62e20] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#e62e20]"
                : "text-[#292929] hover:text-[#e62e20]"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          {!isPending &&
            (user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-[#fff8f3]"
                  aria-expanded={profileMenuOpen}
                >
{avatarSrc && failedImage !== avatarSrc ? (
  <img
    src={avatarSrc}
    alt={user.name || "User"}
    width={40}
    height={40}
    referrerPolicy="no-referrer"
    onError={() => {
      console.log("Google profile image failed:", avatarSrc);
      setFailedImage(avatarSrc);
    }}
    className="h-10 w-10 rounded-full border border-[#eee5db] object-cover"
  />
) : (
  <CircleUserRound
    size={25}
    className="text-[#e62e20]"
  />
)}

                  <span className="max-w-[160px] truncate text-sm font-semibold text-[#292929]">
                    {user.name}
                  </span>

                  <ChevronDown
                    size={17}
                    className={`text-[#777] transition-transform ${profileMenuOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-[#eee5db] bg-white py-2 shadow-lg">
                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#292929] transition hover:bg-[#fff1ed] hover:text-[#e62e20]"
                    >
                      <CircleUserRound size={18} />
                      Profile
                    </Link>
                    <Link
                      href={dashboardUrl}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#292929] transition hover:bg-[#fff1ed] hover:text-[#e62e20]"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>

                    <div className="mx-3 border-t border-[#eee5db]" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#e62e20] transition hover:bg-[#fff1ed] disabled:opacity-60"
                    >
                      <LogOut size={18} />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-[#e62e20] px-5 py-2.5 text-sm font-semibold text-[#e62e20] transition-colors hover:bg-[#fff1ed]"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  className="rounded-lg bg-[#e62e20] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c9251a]"
                >
                  Sign Up
                </Link>
              </>
            ))}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-[#292929] hover:bg-[#fff1ed] lg:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[#eee5db] bg-white px-5 py-5 lg:hidden">
          <div className="mb-3 flex items-center justify-between px-4">
            <span className="text-sm font-semibold text-[#292929] dark:text-gray-200">
              Theme
            </span>
            <ThemeToggle />
          </div>

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${isActive(link.href)
                  ? "bg-[#fff1ed] text-[#e62e20]"
                  : "text-[#292929] hover:bg-[#fff8f3] hover:text-[#e62e20]"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {!isPending && (
            <div className="mt-4 border-t border-[#eee5db] pt-4">
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 transition hover:bg-[#fff8f3]"
                    aria-expanded={profileMenuOpen}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {avatarSrc && failedImage !== avatarSrc ? (
                        <Image
                          src={avatarSrc}
                          alt={user.name || "User"}
                          width={25}
                          height={25}
                          unoptimized
                          onError={() => setFailedImage(avatarSrc)}
                          className="h-[25px] w-[25px] rounded-full object-cover"
                        />
                      ) : (
                        <CircleUserRound
                          size={25}
                          className="text-[#e62e20]"
                        />
                      )}

                      <span className="min-w-0 truncate text-sm font-semibold text-[#292929]">
                        {user.name}
                      </span>
                    </span>

                    <ChevronDown
                      size={18}
                      className={`text-[#777] transition-transform ${profileMenuOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {profileMenuOpen && (
                    <div className="mt-2 overflow-hidden rounded-xl border border-[#eee5db] bg-white py-2">
                      <Link
                        href="/profile"
                        onClick={() => {
                          setIsOpen(false);
                          setProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#292929] transition hover:bg-[#fff1ed] hover:text-[#e62e20]"
                      >
                        <CircleUserRound size={18} />
                        Profile
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => {
                          setIsOpen(false);
                          setProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#292929] transition hover:bg-[#fff1ed] hover:text-[#e62e20]"
                      >
                        <LayoutDashboard size={18} />
                        Dashboard
                      </Link>

                      <div className="mx-3 border-t border-[#eee5db]" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#e62e20] transition hover:bg-[#fff1ed] disabled:opacity-60"
                      >
                        <LogOut size={18} />
                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg border border-[#e62e20] py-3 text-center text-sm font-semibold text-[#e62e20]"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/sign-up"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg bg-[#e62e20] py-3 text-center text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
