import type { Metadata } from "next";
import { Inter, Fraunces, Press_Start_2P, VT323 } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getModeFromRequest } from "@/lib/mode";

const proSans = Inter({
  variable: "--font-pro-sans-var",
  subsets: ["latin"],
  display: "swap",
});

const proSerif = Fraunces({
  variable: "--font-pro-serif-var",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT"],
});

const pixDisplay = Press_Start_2P({
  variable: "--font-pix-display-var",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const pixBody = VT323({
  variable: "--font-pix-body-var",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const mode = await getModeFromRequest();
  const fontVars = `${proSans.variable} ${proSerif.variable} ${pixDisplay.variable} ${pixBody.variable}`;

  return (
    <html lang={lang} className={fontVars}>
      <body data-mode={mode} className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
