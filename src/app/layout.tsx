import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/content/site";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-serif",
});
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: { default: `${site.name}, interior design`, template: `%s, ${site.name}` },
  description: site.intro,
  robots: site.draft ? { index: false, follow: false } : undefined,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
