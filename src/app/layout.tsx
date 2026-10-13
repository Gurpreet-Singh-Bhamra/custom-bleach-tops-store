import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bleach Tops",
  description: "Custom bleach-dyed tops, handmade and one of a kind.",
  openGraph: {
    title: "Bleach Tops",
    description: "Custom bleach-dyed tops, handmade and one of a kind.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Tiger Bloom bleach top with rust linework, styled with jeans and a leather bag",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bleach Tops",
    description: "Custom bleach-dyed tops, handmade and one of a kind.",
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>
          <Header />
          <CartDrawer />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
