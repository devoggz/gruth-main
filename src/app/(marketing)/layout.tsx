// src/app/(marketing)/layout.tsx
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
