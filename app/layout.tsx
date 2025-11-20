import "./globals.css";
import ConditionalNavbar from "../components/ConditionalNavbar";
import Footer from "../components/Footer";
import CookieNotice from "../components/CookieNotice";
import MaintenancePage from "../components/MaintenancePage"; 
import { cookies } from "next/headers";


export const metadata = {
  title: {
    default: "krevv — Guide Designed for Digital & Remote workers.",
    template: "%s | krevv",
  },
 icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/favicon.ico" }
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  description:
    "A guide built for remote professionals and creatives who want to thrive in a digital world.",
  keywords: [
    "blog",
    "stories",
    "inspiration",
    "tech",
    "tutorials",
    "creative writing",
    "lifestyle",
  ],
  metadataBase: new URL("https://cautious-eureka-9gp9qvgv756fpjgr-3000.app.github.dev"),
  authors: [
    {
      name: "Krevv Team",
      url: "https://cautious-eureka-9gp9qvgv756fpjgr-3000.app.github.dev",
    },
  ],
  creator: "Krevv",
  publisher: "Krevv",
  robots: { index: true, follow: true },
  openGraph: {
    title: "krevv — Guide Designed for Digital & Remote workers",
    description:
      "A guide built for remote professionals and creatives who want to thrive in a digital world.",
    url: "https://krevv.com",
    siteName: "krevv",
    images: [
      {
        url: "https://krevv.com/krevv.png",
        width: 1200,
        height: 630,
        alt: "My Blog preview image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "krevv — Guide Designed for Digital & Remote workers.",
    description:
      "A guide built for remote professionals and creatives who want to thrive in a digital world.",
    creator: "@yourhandle",
    images: ["https://cautious-eureka-9gp9qvgv756fpjgr-3000.app.github.dev/krevv.png"],
  },
  alternates: {
    canonical: "https://krevv.com",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const maintenanceEnabled = cookieStore.get("maintenance")?.value === "true";

  return (
    <html lang="en">


      <body className="bg-cream text-gray-800 flex flex-col min-h-screen">

        <ConditionalNavbar />

        <main className="flex-1">
          {maintenanceEnabled ? (
            <MaintenancePage />
          ) : (
            <>
              {children}
              <CookieNotice />
            </>
          )}
        </main>

        <Footer />
      </body>
    </html>
  );
}
