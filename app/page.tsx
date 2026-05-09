"use client";

import { useEffect, useState } from "react";
import Desktop from "@/components/Desktop";
import MobileLayout from "@/components/MobileLayout";

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) return null;
  return isMobile ? <MobileLayout /> : <Desktop />;
}
