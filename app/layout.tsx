import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BackgroundMusicPlayer from "./components/BackgroundMusicPlayer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Feliz Cumpleaños, Osiris",
  description: "Una felicitación interactiva de cumpleaños para Osiris.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <BackgroundMusicPlayer />
      </body>
    </html>
  );
}
