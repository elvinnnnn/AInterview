"use client";
import "./globals.css";
import { Fira_Code } from "next/font/google";
import React from "react";

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-black">{children}</body>
    </html>
  );
}
