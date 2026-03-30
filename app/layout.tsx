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
        </Providers>
      </body>
    </html>
  );
}
