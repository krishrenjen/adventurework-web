"use client";
import { useEffect } from "react";
import { refreshCartNameAndPrice } from "@/common/utils/CartManager";

export default function CartSyncer() {
  useEffect(() => {
    const interval = setInterval(() => {
      //refreshCartNameAndPrice();
    }, 0.5 * 60 * 1000); // 30 seconds

    // Optionally run once immediately
    // refreshCartNameAndPrice();

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return null; // This component has no UI
}
