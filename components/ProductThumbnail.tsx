"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getBaseURL } from "@/common/utils/BaseURL";

export default function ProductThumbnail({ productId, className }: { productId: number, className?: string }) {
  const [imageExists, setImageExists] = useState<boolean | null>(null);

  const url = `${getBaseURL()}/api/products/photo/${productId}`;

  useEffect(() => {
    let didCancel = false;

    const checkImage = async () => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        
        if (!didCancel) setImageExists(res.ok);
      } catch {
        if (!didCancel) setImageExists(false);
        // no console.error to avoid spam
      }
    };

    checkImage();

    return () => {
      didCancel = true;
    };
  }, [url]);

  if (imageExists === false) return null;

  return (
    <Image
      height={120}
      width={120}
      alt=""
      src={url}
      className={className}
      onError={() => setImageExists(false)} // just in case it fails after HEAD passes
    />
  );
}
