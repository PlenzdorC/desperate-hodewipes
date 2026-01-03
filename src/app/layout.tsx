import type { Metadata } from "next";
import { Open_Sans, Cinzel } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Desperate Hordewipes - WoW Gilde",
  description: "Für die Horde! Chaos, Spaß und epische Wipes seit 2019",
  keywords: ["World of Warcraft", "WoW", "Gilde", "Horde", "Raid", "Gaming"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${openSans.variable} ${cinzel.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
