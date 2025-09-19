import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
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
    <html lang="en">
      <body
        className={`${jost.variable} antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
