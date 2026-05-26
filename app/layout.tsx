import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "Yash Verma — Creative Developer & Kinetic Systems Engineer",
  description: "A high-end scrollytelling portfolio showcasing interactive engineering, cinematic motion, and hardware-accelerated layouts."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#010813]">
      <body>
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
