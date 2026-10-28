import type { Metadata } from "next";
import { Bai_Jamjuree, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { IconSprite } from "@/components/Icon";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthModal } from "@/components/AuthModal";
import { ChatWidget } from "@/components/ChatWidget";
import { Toasts } from "@/components/Toasts";

const bai = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bai",
  display: "swap",
});

const pixel = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DonutUp — DonutSMP Arcade & Provably Fair Games",
    template: "%s · DonutUp",
  },
  description:
    "DonutUp is a fan-made, play-money DonutSMP-style arcade. 28 original games, simulated deposits and a provably-fair RNG. No real money, ever.",
  applicationName: "DonutUp",
  keywords: ["DonutUp", "DonutSMP arcade", "play money casino", "provably fair demo"],
  openGraph: {
    title: "DonutUp — DonutSMP Arcade",
    description:
      "28 original mini-games, simulated wallet and a provably-fair RNG. A play-money demo, not a real wagering site.",
    type: "website",
    siteName: "DonutUp",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bai.variable} ${pixel.variable}`}>
      <body>
        <IconSprite />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AppProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <ChatWidget />
          <AuthModal />
          <Toasts />
        </AppProvider>
      </body>
    </html>
  );
}
