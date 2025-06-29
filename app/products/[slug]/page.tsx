"use client";
import { Product, ProductShort } from "@/common/interfaces/Product";
import { isAuthenticated } from "@/common/utils/Auth";
import { getBaseURL } from "@/common/utils/BaseURL";
import { addToCart, getCartItemQuantity } from "@/common/utils/CartManager";
import Breadcrumb from "@/components/Breadcrumb";
import Navbar from "@/components/navbar/Navbar";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PageProps = {
  params: { slug: string };
};

export default function Page({ params }: PageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number | "">(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshCart = () => {
    setRefreshKey(prev => (prev + 1) % 1000);
  }

  useEffect(() => {
    async function fetchData() {
      params = await params;;
      const res = await fetch(`${getBaseURL()}/api/products/${params.slug}`, {
        method: 'GET',
      });

      const similar_res = await fetch(`${getBaseURL()}/api/products/${params.slug}/similar?amount=3`, {
        method: 'GET',
      });

      if (!res.ok) {
        setProduct(null);
      } else {
        setProduct(await res.json());
      }

      if (similar_res.ok) {
        setSimilarProducts(await similar_res.json());
      }

      setLoading(false);
    }

    fetchData();
  }, [params.slug]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Error loading product</p>;

  function renderPurchaseSection(product: Product, forSale: boolean, quantity: number | "" = 1) {
    if (forSale) {
      return (
        <div className="mt-6">
          <p className="text-lg font-semibold text-gray-800 mb-4">Price: ${product.listPrice.toFixed(2)}</p>
          {/* Quantity selector */}
          <div className="flex items-center space-x-4 mb-4">
            <Input className="w-14" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}/>
            <button onClick={() => {
              if(!isAuthenticated()){
                toast.error("You must be logged in to add items to the cart.");
                return;
              }
              let suc = addToCart({productId: product.productId, name: product.name, listPrice: product.listPrice}, quantity === "" ? 1 : quantity);
              if (suc) {
                // Show success message
                toast.success("Product added to cart successfully!");
              } else {
                //ahow error message
                toast.error("Failed to add product to cart.");
              }
              refreshCart();
            }} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
              Add to Cart
            </button>
            {getCartItemQuantity(product.productId) > 0 && (
              <span className="text-sm text-gray-600">
                Already in cart: {getCartItemQuantity(product.productId)}
              </span>
            )}
          </div>
          
        </div>
      );
    } else {
      return (
        <div className="mt-6 text-red-600">
          This product is not available for purchase at this time.
        </div>
      );
    }
  }

  const forSale = product.sellStartDate ? new Date(product.sellStartDate) <= new Date() && product.listPrice > 0 : false;

  return <div className="px-3 py-3">
    <Navbar refreshKey={refreshKey}></Navbar>
    <h1 className="font-medium text-3xl mt-2">{product.name}</h1>
    {product.category && <Breadcrumb items={
      [
        {title: product.category}, 
        {title: product.subcategory}
      ]}
    />}
    <p className="text-gray-700 mb-2">{product.description ?? "No description available"}</p>

    {renderPurchaseSection(product, forSale, quantity)}

    {/* productId, productNumber, size, weight  */}
    <div className="mt-6 pt-4">
      <h2 className="text-xl font-semibold mb-2">Product Information</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full text-gray-700">
      <tbody>
        <tr>
        <td className="border border-gray-300 px-4 py-2 font-semibold">Product ID:</td>
        <td className="border border-gray-300 px-4 py-2">{product.productId}</td>
        </tr>
        <tr>
        <td className="border border-gray-300 px-4 py-2 font-semibold">Product Number:</td>
        <td className="border border-gray-300 px-4 py-2">{product.productNumber}</td>
        </tr>
        <tr>
        <td className="border border-gray-300 px-4 py-2 font-semibold">Size:</td>
        <td className="border border-gray-300 px-4 py-2">{product.size ? `${product.size} ${product.sizeUnitMeasureCode}` : "N/A"}</td>
        </tr>
        <tr>
        <td className="border border-gray-300 px-4 py-2 font-semibold">Weight:</td>
        <td className="border border-gray-300 px-4 py-2">{product.weight ? `${product.weight} ${product.weightUnitMeasureCode}` : "N/A"}</td>
        </tr>
      </tbody>
      </table>
    </div>

    <div className="mt-6 pt-4">
      <h2 className="text-xl font-semibold mb-2">Similar Products</h2>
      <ul className="list-disc pl-5">
        {similarProducts.map((similarProduct) => (
          <li key={similarProduct.productId} className="mb-2">
            <a href={`/products/${similarProduct.productId}`} className="text-blue-600 hover:underline">
              {similarProduct.name} - ${similarProduct.listPrice.toFixed(2)}
            </a>
          </li>
        ))}
      </ul>
    </div>

    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger><h2 className="text-xl font-semibold mb-2">Product JSON</h2></AccordionTrigger>
        <AccordionContent>
          <pre className="bg-gray-100 p-4 rounded border border-gray-300 text-sm text-gray-800">
            {JSON.stringify(product, null, 2)}
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    
  </div>
}

