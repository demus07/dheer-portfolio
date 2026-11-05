import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/content/site";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  variable: "--font-display",
});
const reading = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-reading",
});
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: { default: `${site.name}, interior designer`, template: `%s / ${site.name}` },
  description: "The portfolio of Dheer, an interior design student.",
  robots: site.draft ? { index: false, follow: false } : undefined,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${reading.variable} ${mono.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
