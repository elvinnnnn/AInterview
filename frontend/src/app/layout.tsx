import "./globals.css";
import { Fira_Code } from "next/font/google";

const fira = Fira_Code({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fira.className}>
      <body>{children}</body>
    </html>
  );
}
