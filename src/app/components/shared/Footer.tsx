
import Link from "next/link";
import {
    MapPin,
    Phone,
    Mail,
} from "lucide-react";
import {
    FaFacebookF,
    FaInstagram,
    FaXTwitter,
} from "react-icons/fa6";
import Image from "next/image";

const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Menu", href: "/browse-menu" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
];

const supportLinks = [
    { name: "My Account", href: "/sign-in" },
    { name: "My Orders", href: "/customer/my-orders" },
    { name: "Help & Support", href: "/contact" },
    { name: "Privacy Policy", href: "#" },
];

export default function Footer() {
    return (
        <footer className="bg-[#202020] text-white">
            <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                    <div>
                        <Link href="/" className="flex shrink-0 items-center gap-1">
                            <Image
                                src="/images/categories/allPizza.png"
                                alt="PizzaHub Logo"
                                width={40}
                                height={40}
                            />
                            <span className="text-[25px] font-extrabold tracking-tight text-[#fcfcfc]">
                                Pizza<span className="text-[#e62e20]">Hub</span>
                            </span>
                        </Link>

                        <p className="max-w-[280px] text-sm leading-7 text-white/60">
                            Your favorite pizza, delivered fresh and hot.
                            Discover delicious flavors and enjoy every bite with PizzaHub.
                        </p>

                        <div className="mt-6 flex items-center gap-3">
                            {[FaFacebookF, FaInstagram, FaXTwitter].map((Icon, index) => (
                                <Link
                                    key={index}
                                    href="#"
                                    aria-label={["Facebook", "Instagram", "Twitter"][index]}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#E6392E]"
                                >
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-6 text-lg font-bold">Quick Links</h3>
                        <ul className="space-y-4">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-white/60 transition hover:text-[#E6392E]"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-6 text-lg font-bold">Customer Support</h3>
                        <ul className="space-y-4">
                            {supportLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-white/60 transition hover:text-[#E6392E]"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-6 text-lg font-bold">Contact Us</h3>

                        <ul className="space-y-5">
                            <li className="flex items-start gap-3 text-sm leading-6 text-white/60">
                                <MapPin size={19} className="mt-1 shrink-0 text-[#E6392E]" />
                                <span>Chattogram, Bangladesh</span>
                            </li>

                            <li className="flex items-center gap-3 text-sm text-white/60">
                                <Phone size={18} className="shrink-0 text-[#E6392E]" />
                                <span>+880 1234-567890</span>
                            </li>

                            <li className="flex items-center gap-3 text-sm text-white/60">
                                <Mail size={18} className="shrink-0 text-[#E6392E]" />
                                <span>support@pizzahub.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-14 border-t border-white/10 pt-7 text-center">
                    <p className="text-sm text-white/50">
                        &copy; 2026 PizzaHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
