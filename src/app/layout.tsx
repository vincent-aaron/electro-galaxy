import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { DemoNotice } from "@/components/layout/DemoNotice";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AIAssistant from "@/components/ai/AIAssistant";
import { getCategories } from "@/lib/data/products";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Electro Galaxy | Portfolio Demo Electronics Store",
    template: "%s | Electro Galaxy",
  },
  description:
    "Electro Galaxy is a portfolio demo of a full-stack electronics store built with Next.js and Supabase. No real payments or orders are processed.",
  keywords: ["portfolio", "demo store", "e-commerce", "Next.js", "Supabase"],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <DemoNotice />
        <Header categories={categories} />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <AIAssistant />
      </body>
    </html>
  );
}
