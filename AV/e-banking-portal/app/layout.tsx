import "./globals.css";
import type { Metadata } from "next";
import EBankingLayout from "./EBankingLayout";

export const metadata: Metadata = {
  title: "AURUM VAULT - E-Banking Portal",
  description: "Secure online banking for AURUM VAULT customers",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  themeColor: "#1E4B35",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JPHeritage",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <EBankingLayout>{children}</EBankingLayout>
      </body>
    </html>
  );
}
