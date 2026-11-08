import type { Metadata, Viewport } from "next";
import { Geist, Cormorant_Garamond, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--ff-sans", subsets: ["latin"] });
const display = Cormorant_Garamond({
  variable: "--ff-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const hindi = Tiro_Devanagari_Hindi({ variable: "--ff-hindi", subsets: ["devanagari", "latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Shiv Shringar Sewa Samiti — Prachin Hanuman Mandir, East Azad Nagar",
  description:
    "Daily Shiv Shringar Darshan at 9:00 PM and Shayan Aarti at 9:15 PM. Bhajan, kirtan, vishesh shringar, Rudrabhishek and yatras — Prachin Hanuman Mandir, East Azad Nagar, Delhi 110051.",
  icons: { icon: "/brand/logo.png", apple: "/brand/logo.png" },
  openGraph: {
    title: "Shiv Shringar Sewa Samiti — हर हर महादेव",
    description: "Daily Shiv Shringar Darshan @ 9:00 PM • Shayan Aarti @ 9:15 PM • Prachin Hanuman Mandir, East Azad Nagar, Delhi",
    images: ["/brand/logo.png"],
  },
};

export const viewport: Viewport = { themeColor: "#fbf7f1" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${hindi.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
