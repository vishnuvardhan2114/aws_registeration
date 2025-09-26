import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Toaster } from "sonner";
import ConvexClientProvider from "./components/Providers/ConvexClientProvider";
import Footer from "./components/Footer";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AGM Registration",
  description: "AGM Registration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jost.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning={true}
      >
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster position="top-center" richColors />
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}