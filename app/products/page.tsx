"use client"
import { useEffect, useState, useCallback } from "react";
import ProductOverview, {ProductProps} from "@/components/ProductOverview";
import { callAuthenticatedApi, isEmployee, logout, protectRoute } from "@/common/utils/Auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuGrid2X2Plus } from "react-icons/lu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Navbar from "@/components/navbar/Navbar";
import { addToCart } from "@/common/utils/CartManager";
import { getBaseURL } from "@/common/utils/BaseURL";


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

  const [refreshKey, setRefreshKey] = useState(0);

  const refreshCart = () => {
    setRefreshKey(prev => (prev + 1) % 1000);
  }

  const addToCartCallback = ((productId: number, name: string, listPrice: number, quantity: number) => {
    console.log("Adding to cart:", productId, quantity);
    addToCart({productId: productId, name: name, listPrice: listPrice}, quantity);
    refreshCart();
  })

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
        const res = await fetch(
          `${getBaseURL()}/api/products?${params.toString()}`,
          {
            method: 'GET',
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        setProducts(data.data);
        console.log("Products fetched:", data.data);
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
  //font-medium text-2xl
 return (
    <div className="px-3 py-3 space-y-4">
      <Navbar refreshKey={refreshKey}>
        <h1 className="text-2xl font-bold min-h-full text-center">Product Viewer</h1>
      </Navbar>
      
      <div className="flex justify-between items-center">
        {/* --- Filters --- */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label>Search</Label>
            <Input 
              placeholder="Name or Product Number"
              value={query}
              onChange={e => { 
                setQuery(e.target.value); 
                setPage(1); 
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Minimum Price</Label>
            <Input 
              placeholder="Minimum Price"
              type="number"
              value={minPrice}
              min={0}
              onChange={e => { 
                setMinPrice(e.target.value === "" ? "" : Number(e.target.value)); 
                setPage(1); 
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Maximum Price</Label>
            <Input 
              placeholder="Maximum Price"
              type="number"
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

            {isEmployee() && (
            <Tooltip>
              <TooltipTrigger>
              <Button
                variant="default"
                onClick={() => {
                window.location.href = '/products/create'
                }}>
                <LuGrid2X2Plus />
              </Button>
              </TooltipTrigger>
              <TooltipContent>
              <p>Create new product</p>
              </TooltipContent>
            </Tooltip>
            )}
          
          
        </div>
        
      </div>
      

      {/* --- Results --- */}
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <ProductOverview key={p.productId} {...p} isEmployee={isEmployee()} addToCartCallback={addToCartCallback} />
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