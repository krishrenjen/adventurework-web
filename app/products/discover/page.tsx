"use client";
import { getBaseURL } from "@/common/utils/BaseURL";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export interface ProductItem {
  productID: number;
  productName: string;
  productPrice: number;
}

export interface SubcategoryGroup {
  subcategory: string;
  products: ProductItem[];
}

export type DiscoveryResponse = {
  [categoryName: string]: SubcategoryGroup[];
};

export default function Discover() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryResponse>({});
  const [recommendedCategory, setRecommendedCategory] = useState<string | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${getBaseURL()}/api/products/discovery`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DiscoveryResponse = await res.json();
        setDiscovery(data);

        const categories = Object.keys(data);
        if (categories.length > 0) {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          setRecommendedCategory(randomCategory);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load discovery.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 px-3 py-6">
      {recommendedCategory && discovery[recommendedCategory] && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">
            Your recommended category: <span className="text-blue-600">{recommendedCategory}</span>
          </h2>
          <div className="space-y-6 px-2 flex flex-col items-center justify-center w-full">
            {discovery[recommendedCategory].map((sub) => (
              <div key={sub.subcategory} className="w-full flex flex-col items-center justify-center">
                <h3
                  id={`${recommendedCategory}${sub.subcategory}`}
                  className="text-2xl font-semibold text-blue-500 mb-2 w-full text-left"
                >
                  {sub.subcategory}
                </h3>
                <Carousel className="relative w-full px-5 mx-5 max-w-10/12">
                  <CarouselContent>
                    {sub.products.map((product) => (
                      <CarouselItem
                        key={product.productID}
                        className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                      >
                        <div className="border rounded-lg p-4 shadow hover:shadow-md transition h-full flex flex-col justify-between">
                          <div>
                            <h4 className="text-lg font-medium">{product.productName}</h4>
                            <p className="text-gray-700 mb-2">${product.productPrice.toFixed(2)}</p>
                          </div>
                          <Link
                            href={`/products/${product.productID}`}
                            className="inline-block bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm text-center"
                          >
                            View
                          </Link>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
