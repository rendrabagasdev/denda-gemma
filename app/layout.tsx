import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | GEMMA Tobratan",
    default: "GEMMA Tobratan - Sistem Informasi Dusun Tobratan",
  },
  description: "Portal resmi Gerakan Masyarakat Muda Mudi (GEMMA) Dusun Tobratan. Sistem manajemen denda, undangan digital, dan administrasi organisasi kepemudaan.",
  keywords: ["GEMMA Tobratan", "Dusun Tobratan", "Gerakan Masyarakat Muda Mudi", "Organisasi Pemuda", "Undangan Digital Tobratan", "Denda Gemma"],
  authors: [{ name: "GEMMA Tobratan" }],
  openGraph: {
    title: "GEMMA Tobratan - Sistem Informasi Dusun",
    description: "Sistem administrasi dan informasi Gerakan Masyarakat Muda Mudi Dusun Tobratan.",
    type: "website",
    locale: "id_ID",
  },
  icons:{
    icon: "/favicon-rounded.svg"
  }
};

import { Toaster } from "react-hot-toast"
import { Analytics } from "@vercel/analytics/next"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="top-center" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
