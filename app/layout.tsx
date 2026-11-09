import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "OwnTerms — Machine-Readable IP Rights Licensing for AI Agents",
  description:
    "Your agent can use it—after it licenses it. Grounded intent extraction, deterministic compatibility, PayPal Orders v2 settlement, and tamper-evident Rights Receipts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FBFBFA] text-[#091A2A]">
        <Suspense fallback={<div className="h-16 border-b border-[#E4E2DB] bg-[#FBFBFA]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#E4E2DB] bg-[#F4F3EF] py-8 text-xs text-[#64748B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#091A2A]">OwnTerms</span>
              <span>— Built with PayPal Orders v2, APIMatic, AG Grid, and Google Gemini</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/context-plugins/paypal-typescript-sdk"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#091A2A] underline underline-offset-2"
              >
                APIMatic PayPal Plugin
              </a>
              <a
                href="https://developer.paypal.com/docs/api/orders/v2/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#091A2A] underline underline-offset-2"
              >
                PayPal Orders v2
              </a>
              <span className="text-[#16805B] font-semibold">● PayPal Sandbox Certified</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
