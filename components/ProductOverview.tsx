"use client"
import { User, UserRole } from '@/common/interfaces/Roles';
import { callAuthenticatedApi } from '@/common/utils/Auth';
import { getBaseURL } from '@/common/utils/BaseURL';
import Link from 'next/link';
import React, { useState } from 'react';

export interface ProductProps {
  productId: number;
  name: string;
  productNumber: string;
  listPrice: number;
  category?: string;
  isEmployee?: boolean;
}


export default function ProductOverview({
  productId,
  name,
  productNumber,
  listPrice,
  isEmployee = false,
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
    <div className="p-6 bg-white shadow-md rounded-lg border border-gray-200 space-y-2">
      <h2 className="text-xl font-bold text-gray-800">{name}</h2>
      {productNumber && (
        <p className="text-sm text-gray-600">Product Number: {productNumber}</p>
      )}
      <p className="text-lg font-semibold text-gray-800">
        Price: ${listPrice.toFixed(2)}
      </p>

      <div className="flex gap-3 pt-3">
        <Link
          href={`/products/${productId}`}
          className="px-4 py-1 border rounded text-sm hover:bg-gray-100"
        >View</Link>

        {isEmployee && 
          <Link
            href={`/products/${productId}/edit`}
            className="px-4 py-1 border rounded text-sm text-blue-600 hover:bg-blue-50"
          >Edit</Link>
        }

        {isEmployee && 
          <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-1 border rounded text-sm text-red-600 hover:bg-red-50 disabled:opacity-40 cursor-pointer"
          >{deleting ? "Deleting…" : "Delete"}</button>
        }

        
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}