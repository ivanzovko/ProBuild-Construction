import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Navigation } from "./_components/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pro-Build Construction",
  description: "Find trusted construction partners and build without stress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900`}>
        <Tooltip.Provider delayDuration={200} skipDelayDuration={0}>
          <Navigation />
          <main className="pt-14 md:pt-16 min-h-screen">
            <NuqsAdapter>
              {children}
              <Toaster 
                position="bottom-right" 
                richColors 
                expand={false}
                toastOptions={{
                  style: {
                    borderRadius: '16px',
                    border: '1px solid #1e293b',
                    background: '#0f172a',
                    color: '#fff',
                  },
                }}
              />
            </NuqsAdapter>
          </main>
        </Tooltip.Provider>
      </body>
    </html>
  );
}