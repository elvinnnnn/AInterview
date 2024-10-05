"use client";
import "./globals.css";
import { Fira_Code } from "next/font/google";
import React, { useState } from "react";

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
  const [isDark, setIsDark] = useState<boolean>(false);

  return (
    <html lang="en" className={fira.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={isDark ? "dark dark:bg-black" : "bg-black"}>
        <button
          className="fixed top-0 right-0"
          onClick={() => {
            setIsDark(!isDark);
          }}
        >
          Dark/Light
        </button>
        {children}
      </body>
    </html>
  );
}
