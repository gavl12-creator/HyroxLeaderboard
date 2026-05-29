import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HYROX Analytics Platform",
  description: "A sports analytics MVP for HYROX event leaderboards, station rankings, progression charts, and AI race summaries.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
