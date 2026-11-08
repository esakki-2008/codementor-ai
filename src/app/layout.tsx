import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeMentor AI — Learn to code with confidence",
  description:
    "Learn programming from zero with guided Python lessons, practice, and beginner-friendly explanations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
