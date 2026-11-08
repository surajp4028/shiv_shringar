import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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

const TITLE = "Shiv Shringar Sewa Samiti — Prachin Hanuman Mandir, East Azad Nagar";
const DESCRIPTION =
  "Daily Shiv Shringar Darshan at 9:00 PM and Shayan Aarti at 9:15 PM. Bhajan, kirtan, special shringar, Rudrabhishek and yatras — Prachin Hanuman Mandir, East Azad Nagar, Delhi 110051.";
const SHARE_TITLE = "Shiv Shringar Sewa Samiti — Har Har Mahadev";
const SHARE_DESCRIPTION = "Daily Shringar Darshan 9:00 PM • Shayan Aarti 9:15 PM • Prachin Hanuman Mandir, East Azad Nagar, Delhi";

/**
 * The site's public address, taken from the request itself so link previews
 * (WhatsApp, Facebook…) always point at whatever domain the site is opened on —
 * the vercel.app URL today, a custom domain tomorrow — with no config change.
 */
async function siteUrl(): Promise<URL> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.|\[::1\])/.test(host) ? "http" : "https");
    return new URL(`${proto.split(",")[0]}://${host}`);
  }
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && !env.includes("localhost")) return new URL(env);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return new URL("http://localhost:3000");
}

export async function generateMetadata(): Promise<Metadata> {
  const base = await siteUrl();
  const image = {
    url: new URL("/brand/og-image.jpg", base).toString(),
    width: 1200,
    height: 630,
    alt: "Shiv Shringar Sewa Samiti — Prachin Hanuman Mandir, East Azad Nagar, Delhi",
    type: "image/jpeg",
  };
  return {
    metadataBase: base,
    title: TITLE,
    description: DESCRIPTION,
    icons: { icon: "/brand/logo.png", apple: "/brand/logo.png" },
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: base.toString(),
      siteName: "Shiv Shringar Sewa Samiti",
      locale: "en_IN",
      title: SHARE_TITLE,
      description: SHARE_DESCRIPTION,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: SHARE_TITLE, description: SHARE_DESCRIPTION, images: [image.url] },
  };
}

export const viewport: Viewport = { themeColor: "#fbf7f1" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${hindi.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
