<<<<<<< HEAD
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
=======
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VidyaHub | Administrative Intelligence",
  description: "Centralized campus management and administrative portal for VidyaHub ecosystem.",
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
};

export default function RootLayout({
  children,
<<<<<<< HEAD
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
=======
}: Readonly<{
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
        </Providers>
      </body>
    </html>
  );
}