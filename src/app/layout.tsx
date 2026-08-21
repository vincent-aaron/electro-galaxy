import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AIAssistant from "@/components/ai/AIAssistant";
import { getCategories } from "@/lib/data/products";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Electro Galaxy | Premium Electronics & Smart Appliances",
    template: "%s | Electro Galaxy",
  },
  description:
    "Shop premium electronics, smart appliances, and home gadgets at Electro Galaxy. Free shipping on orders over ₱5,000. Trusted by thousands across the Philippines.",
  keywords: ["electronics", "appliances", "smart home", "Philippines", "e-commerce"],
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
        <Header categories={categories} />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <AIAssistant />
      </body>
    </html>
  );
}
