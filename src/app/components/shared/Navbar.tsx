
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Menu", href: "/browse-menu" },
  { name: "About Us", href: "/about" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/#how-it-works") return false;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#eee5db] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-1">
          <span className="text-[30px]">🍕</span>
          <span className="text-[25px] font-extrabold tracking-tight text-[#24211f]">
            Pizza<span className="text-[#e62e20]">Hub</span>
          </span>
        </Link>

        <nav className="hidden h-full items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative flex h-full items-center text-[14px] font-semibold transition-colors ${
                isActive(link.href)
                  ? "text-[#e62e20] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#e62e20]"
                  : "text-[#292929] hover:text-[#e62e20]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
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
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-[#292929] hover:bg-[#fff1ed] sm:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[#eee5db] bg-white px-5 py-5 sm:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? "bg-[#fff1ed] text-[#e62e20]"
                    : "text-[#292929] hover:bg-[#fff8f3] hover:text-[#e62e20]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex gap-3">
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
        </div>
      )}
    </header>
  );
}
