import { Inter } from "next/font/google";
import HeaderNavbar from "@/components/HeaderNavbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "AarogyaPulse — portable health records",
  description: "One portable health record for every Indian, created where they already are.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-black text-white flex flex-col min-h-screen">
        <HeaderNavbar />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}