import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HourBank",
  description: "Neighborhood time-banking marketplace for local service exchanges.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
