import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "DebtFree AI — Your Personal Debt Freedom Coach",
  description:
    "Track debts, simulate payoff strategies, and get AI-powered guidance to become debt-free faster.",
  keywords: ["debt management", "financial freedom", "debt payoff", "snowball", "avalanche"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
