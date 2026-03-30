import "./globals.css";
import { Gideon_Roman } from "next/font/google";
import type { Metadata } from "next";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";

const gideon = Gideon_Roman({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "VidyaHub - University Management System",
  description: "Manage your university life with ease.",
<<<<<<< HEAD
=======
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
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${gideon.className} min-h-screen bg-background antialiased`}>
        <Providers>
          <TooltipProvider>
            {children}
            <Sonner position="top-center" expand={true} richColors />
          </TooltipProvider>
<<<<<<< HEAD
=======
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
>>>>>>> 5ab27333530047be74773d04fc06bad319191594
        </Providers>
      </body>
    </html>
  );
}