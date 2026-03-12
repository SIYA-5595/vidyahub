import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VidyaHub - University Management System",
  description: "Manage your university life with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Providers>
          <TooltipProvider>
            {children}
            <Sonner />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
