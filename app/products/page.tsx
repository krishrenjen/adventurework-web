"use client"
import { useEffect, useState, useCallback } from "react";
import ProductOverview, {ProductProps} from "@/components/ProductOverview";
import Link from "next/link";
import { User, UserRole } from "@/common/interfaces/Roles";
import { callAuthenticatedApi, isEmployee, logout, protectRoute } from "@/common/utils/Auth";

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type ApiResponse = {
  pageNumber: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  data: ProductProps[];
}

function ProductsList() {
  protectRoute(true, false);
  
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 25; // Default page size

  const [products, setProducts] = useState<ProductProps[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dQuery    = useDebounce(query);
  const dMinPrice = useDebounce(minPrice);
  const dMaxPrice = useDebounce(maxPrice);
  const dPage     = useDebounce(page);

  const buildQueryString = useCallback(() => {
    const params: URLSearchParams = new URLSearchParams();
    if (query.trim()) params.append("queryNameID", query.trim());
    if (minPrice !== "") params.append("listPriceMin", String(minPrice));
    if (maxPrice !== "") params.append("listPriceMax", String(maxPrice));
    params.append("pageNumber", page.toString());
    params.append("pageSize", pageSize.toString());
    return params.toString();
  }, [query, minPrice, maxPrice, page, pageSize]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (dQuery.trim())   params.append("queryNameId", dQuery.trim());
    if (dMinPrice !== "") params.append("listPriceMin", String(dMinPrice));
    if (dMaxPrice !== "") params.append("listPriceMax", String(dMaxPrice));
    params.append("pageNumber", String(dPage));
    params.append("pageSize", String(pageSize));

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await callAuthenticatedApi(
          `products?${params.toString()}`,
          { method: 'GET' },
          '/login',
          () => setLoading(false)
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        setProducts(data.data);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [dQuery, dMinPrice, dMaxPrice, dPage, pageSize]);

 return (
    <div className="px-3 py-3 space-y-6">
      <div className="flex justify-between items-center">
        {/* --- Filters --- */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Search</label>
            <input
              className="border rounded p-2"
              placeholder="Name or Product Number"
              value={query}
              onChange={e => { 
                setQuery(e.target.value); 
                setPage(1); 
              }}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Min Price</label>
            <input
              type="number"
              className="border rounded p-2"
              value={minPrice}
              min={0}
              onChange={e => { 
                setMinPrice(e.target.value === "" ? "" : Number(e.target.value)); 
                setPage(1); 
              }}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Max Price</label>
            <input
              type="number"
              className="border rounded p-2"
              value={maxPrice}
              min={0}
              onChange={e => { 
                setMaxPrice(e.target.value === "" ? "" : Number(e.target.value)); 
                setPage(1); 
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="px-4 py-1 rounded text-xl border border-red-400 text-red-400 hover:bg-gray-100 cursor-pointer"
          title="Logout"
          >Logout</button>
          <Link
          href={`/products/create`}
          className="px-4 py-1 border rounded text-xl hover:bg-gray-100"
          title="Create New Product"
          >+</Link>
          
        </div>
        
      </div>
      

      {/* --- Results --- */}
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <ProductOverview key={p.productId} {...p} isEmployee={isEmployee()} />
            ))}
          </div>

          {/* --- Pagination --- */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              className="px-3 py-1 border rounded disabled:opacity-40 cursor-pointer"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              ‹ Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-40 cursor-pointer"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next ›
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductsList;