"use client"
import { callAuthenticatedApi, isAuthenticated } from '@/common/utils/Auth';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import { getBaseURL } from '@/common/utils/BaseURL';
import ProductThumbnail from './ProductThumbnail';
import clsx from 'clsx';

export interface ProductProps {
  productId: number;
  name: string;
  productNumber: string;
  listPrice: number;
  addToCartCallback?: (productId: number, name: string, listPrice: number, quantity: number) => void;
  isEmployee?: boolean;
  className?: string;
  animate?: boolean;
}


export default function ProductOverview({
  productId,
  name,
  productNumber,
  listPrice,
  addToCartCallback,
  isEmployee = false,
  className = "",
  animate = false
}: ProductProps) {

  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const handleDelete = async () => {
    if (deleting) return;
    const confirm = window.confirm(`Delete “${name}” permanently?`);
    if (!confirm) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await callAuthenticatedApi(
        `products/${productId}`,
        { method: "DELETE" },
        '/login',
        () => setDeleting(false)
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Optional: refresh page or remove item from UI
    } catch (err: any) {
      console.error(err);
      setError("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className={clsx(className,"p-6  shadow-md rounded-lg border border-gray-200 space-y-2 group")}>
      <ProductThumbnail productId={productId} className={animate ? "group-hover:translate-y-[-3px] transition-all duration-300" : ""} />
      <h2 className="text-xl font-bold text-gray-800">{name}</h2>
      {productNumber && (
        <p className="text-sm text-gray-600">Product Number: {productNumber}</p>
      )}
      <p className="text-lg font-semibold text-gray-800">
        Price: ${listPrice.toFixed(2)}
      </p>

      <div className="flex gap-3 pt-3">
        <Button asChild variant="default">
          <Link
          href={`/products/${productId}`}
          prefetch={true}
          >View</Link>
        </Button>
      
        

        {!isEmployee && isAuthenticated() &&
        <Button
          onClick={() => {
            if (addToCartCallback) {
              console.log(`Adding product ${productId} to cart`);
              addToCartCallback(productId, name, listPrice, 1);
              toast.success("Product added to cart successfully!");
            } else {
              console.warn("No addToCartCallback provided");
              toast.error("This product cannot be added to the cart.");
            }
          }}
          type="button"
          className="cursor-pointer"
          variant="secondary">Add to Cart
        </Button>}

        {isEmployee && 
          <Button asChild variant="secondary">
            <Link
              href={`/products/${productId}/edit`}
              prefetch={true}
            >Edit</Link>
          </Button>
        }

        {isEmployee && 
          <Button
          onClick={handleDelete}
          type="button"
          className="cursor-pointer"
          disabled={deleting}
          variant="destructive"
          >{deleting ? "Deleting…" : "Delete"}</Button>
        }

        
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}