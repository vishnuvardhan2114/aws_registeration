import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "./components/Providers/ConvexClientProvider";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});


export const metadata: Metadata = {
  title: "AWS Registeration",
  description: "AWS Registeration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider >
      <html lang="en">
        <body
          className={`${jost.variable} antialiased`}
          suppressHydrationWarning={true}
        >
          <ConvexClientProvider>
            {children}
            <Toaster position="top-center" richColors />
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
