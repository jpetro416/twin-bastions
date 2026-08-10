import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twin Bastions: Colossus Protocol",
  description: "Cooperative layered tower defense against Proto-Colossi. Defend the twin bastions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-bastion-dark min-h-screen">
        {children}
      </body>
    </html>
  );
}
