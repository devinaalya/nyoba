import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sector Seven Integrated Operating System",
  description: "Integrated Operating System for Sector Seven",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-zinc-50 text-zinc-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto h-screen bg-zinc-50">
          {children}
        </main>
      </body>
    </html>
  );
}
