import "./globals.css";

import type { Metadata } from "next";
import { Bricolage_Grotesque, Poppins } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "SelfCheck",
  description:
    "Autoatendimento para restaurantes: cardápio digital, pagamento online e acompanhamento do pedido.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} ${bricolage.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
