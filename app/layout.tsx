import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { SiteChrome } from "@/components/layout/site-chrome";

export const metadata: Metadata = {
  title: "Heeby",
  description: "템플릿 기반 개인 기록 앱",
  icons: {
    icon: "/images/me.png",
    shortcut: "/images/me.png",
    apple: "/images/me.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
