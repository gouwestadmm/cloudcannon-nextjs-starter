import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import Footer from "@/components/core/layout/footer";
import Menu from "@/components/core/layout/menu";
import { RegisterComponents } from "@/lib/component-registry";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-family-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s - Cloudcannon Next.js Starter",
    default: "Cloudcannon Next.js Starter",
  },
  description:
    "A starter template for Next.js and Cloudcannon, using App Router, Content Collections, Tailwind and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isCloudCannon = process.env.ENVIRONMENT === "cloudcannon";
  return (
    <html
      className={`${inter.variable} accent-primary [text-rendering:geometricPrecision] selection:bg-black-100 selection:text-primary`}
      lang="en"
    >
      <body className="">
        {isCloudCannon && <RegisterComponents />}
        <Menu />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
