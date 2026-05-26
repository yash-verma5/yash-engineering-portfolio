import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import { KonamiProvider } from "@/components/KonamiProvider";

export const metadata: Metadata = {
  title: "Yash Verma - Enterprise Software Engineer",
  description:
    "Backend and integration engineering portfolio focused on Java, Spring Boot, Apache NiFi, Apache Solr, OMS workflows, and production debugging."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#010813]">
      <body>
        <KonamiProvider>
          <LenisProvider>{children}</LenisProvider>
        </KonamiProvider>
      </body>
    </html>
  );
}
