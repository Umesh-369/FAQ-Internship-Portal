import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import YakshaChat from "../components/YakshaChat";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yaksha FAQ & Support Portal | Vicharanashala, IIT Ropar",
  description:
    "Official FAQ, inquiry raising, and AI-powered chatbot assistant for the Vicharanashala Internship at IIT Ropar. Get instant solutions, suggest FAQs, and track your queries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900" suppressHydrationWarning>
        <Providers>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <YakshaChat />
        </Providers>
      </body>
    </html>
  );
}
