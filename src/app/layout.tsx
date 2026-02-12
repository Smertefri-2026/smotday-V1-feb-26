import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Sora, Ranchers } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const ranchers = Ranchers({
  variable: "--font-ranchers",
  subsets: ["latin"],
  weight: "400",
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Smooday", template: "%s • Smooday" },
  description: "Smooday – more than food, more than training.",
  applicationName: "Smooday",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#16A34A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body
        className={[
          inter.variable,
          sora.variable,
          ranchers.variable,
          geistMono.variable,
          "min-h-screen bg-background text-foreground antialiased",
        ].join(" ")}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}