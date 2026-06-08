import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "DebtFree AI — Know your debt-free date",
  description: "Track debts, simulate payoff strategies, and get a personalized plan to become debt-free faster.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-[#07070d] text-[#f0f0f8] antialiased">
        {children}
      </body>
    </html>
  );
}
