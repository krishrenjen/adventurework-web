"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { getBaseURL } from '@/common/utils/BaseURL';
import { callAuthenticatedApi, protectRoute } from '@/common/utils/Auth';

export default function EditProduct({ params }: { params: { slug: string } }) {
  useEffect(() => {
    protectRoute(true, true);
  }, []);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const id = params.slug; // refactor this for client component (deprecated behavior)

  useEffect(() => {
    console.log("Fetching product with ID:", id);
    async function fetchProduct() {
      const res = await callAuthenticatedApi(
        `products/${id}`,
        { method: 'GET' },
        '/login',
        () => setLoading(false)
      )
      const data = await res.json();
      console.log(data);
      setProduct(data);
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // check product data validation

    // Ensure required fields are filled
    if (!product.name || !product.listPrice || !product.standardCost) {
      console.error('Required fields are missing:', {
        name: product.name,
        listPrice: product.listPrice,
        standardCost: product.standardCost,
      });
      alert('Please fill in all required fields.');
      setSaving(false);
      return;
    }

    // Validate numeric fields
    if (isNaN(product.listPrice) || isNaN(product.standardCost)) {
      alert('List Price and Standard Cost must be valid numbers.');
      setSaving(false);
      return;
    }

    // Validate that listPrice and standardCost are positive
    if (product.listPrice <= 0 || product.standardCost <= 0) {
      alert('List Price and Standard Cost must be positive non-zero values.');
      setSaving(false);
      return;
    }

    // Validate size and weight if provided
    if (product.size && isNaN(parseFloat(product.size))) {
      alert('Size must be a valid number if provided.');
      setSaving(false);
      return;
    }
    // Ensure weight is a number if provided  
    if (product.weight && isNaN(parseFloat(product.weight))) { 
      alert('Weight must be a valid number if provided.');
      setSaving(false);
      return;
    }

    // Weight must be in format decimal(8, 2), length 8, max 2 decimal places
    if (product.weight && product.weight.toString().length > 8 && !/^\d+(\.\d{1,2})?$/.test(product.weight.toString())) {
      alert('Weight must be a valid number with up to 8 digits, including 2 decimal places.');
      setSaving(false);
      return;
    }

    // Weight and size unit codes must be 3 characters long max
    if (product.sizeUnitMeasureCode && product.sizeUnitMeasureCode.length > 3) {
      alert('Size Unit Measure Code must be 3 characters or less.');
      setSaving(false);
      return;
    }

    if (product.weightUnitMeasureCode && product.weightUnitMeasureCode.length > 3) {
      alert('Weight Unit Measure Code must be 3 characters or less.');
      setSaving(false);
      return;
    }

    // Weight and size must be positive if provided
    if (product.size && parseFloat(product.size) <= 0) {
      alert('Size must be a positive number if provided.');
      setSaving(false);
      return;
    }

    if (product.weight && parseFloat(product.weight) <= 0) {
      alert('Weight must be a positive number if provided.');
      setSaving(false);
      return;
    }

    // Description can be empty, but if provided, it should not exceed 400 characters
    if (product.description && product.description.length > 400) {
      alert('Description must be 400 characters or less.');
      setSaving(false);
      return;
    }
    // Name must be 50 characters or less
    if (product.name.length > 50) {
      alert('Name must be 50 characters or less.');
      setSaving(false);
      return;
    }
    
    const res = await callAuthenticatedApi(
      `products/${id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      },
      '/login',
      () => setSaving(false)
    );

    setSaving(false);
    if (res.ok) {
      router.push(`/products/${id}`);
    } else {
      alert('Failed to update product\n' + (await res.text()));
      console.error('Failed to update product:', await res.text());
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold">Edit Product</h1>

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="w-full border p-2"
          value={product.name}
          maxLength={50}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full border p-2"
          value={product.description ?? ''}
          maxLength={400}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">List Price</label>
        <input
          type="number"
          className="w-full border p-2"
          value={product.listPrice}
          onChange={(e) => setProduct({ ...product, listPrice: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Standard Cost</label>
        <input
          type="number"
          className="w-full border p-2"
          value={product.standardCost}
          onChange={(e) => setProduct({ ...product, standardCost: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Size</label>
        <input
          className="w-full border p-2"
          value={product.size ?? ''}
          maxLength={5}
          onChange={(e) => setProduct({ ...product, size: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Size Unit</label>
        <input
          className="w-full border p-2"
          value={product.sizeUnitMeasureCode ?? ''}
          maxLength={3}
          onChange={(e) => setProduct({ ...product, sizeUnitMeasureCode: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Weight</label>
        <input
          type="number"
          className="w-full border p-2"
          value={product.weight ?? ''}
          // format decimal(8, 2)
          step="0.01"
          maxLength={8}
          onChange={(e) => setProduct({ ...product, weight: parseFloat(e.target.value) || null })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Weight Unit</label>
        <input
          className="w-full border p-2"
          value={product.weightUnitMeasureCode ?? ''}
          maxLength={3}
          onChange={(e) => setProduct({ ...product, weightUnitMeasureCode: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
