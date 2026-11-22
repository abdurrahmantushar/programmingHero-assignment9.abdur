
import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Bengali, Roboto_Slab } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "./components/shared/ConditionalLayout";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PizzaHub | Delicious Pizza Delivered",
  description:
    "Discover delicious pizzas, explore restaurants, and order your favorite pizza with PizzaHub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${robotoSlab.variable} ${notoSansBengali.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col"
        style={{
          fontFamily: `${robotoSlab.style.fontFamily}, ${notoSansBengali.style.fontFamily}, sans-serif`,
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="pizzahub-theme"
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <ConditionalLayout>{children}</ConditionalLayout>
          </Suspense>

          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
