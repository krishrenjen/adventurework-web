"use client";
import { Product, ProductShort } from "@/common/interfaces/Product";
import { callAuthenticatedApi, protectRoute } from "@/common/utils/Auth";
import Breadcrumb from "@/components/Breadcrumb";
import { useEffect, useState } from "react";

type PageProps = {
  params: { slug: string };
};

export default function Page({ params }: PageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductShort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    protectRoute(true, false);

    async function fetchData() {
      params = await params;;
      const res = await callAuthenticatedApi(
        `products/${params.slug}`,
        { method: 'GET' },
        '/login',
        () => setLoading(false)
      );

      const similar_res = await callAuthenticatedApi(
        `products/${params.slug}/similar?amount=3`,
        { method: 'GET' },
        '/login',
        () => setLoading(false)
      );

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

  const forSale = product.sellStartDate ? new Date(product.sellStartDate) <= new Date() && product.listPrice > 0 : false;

  return <div className="px-3 py-3">
    {product.category && <Breadcrumb items={[product.category, product.subcategory]}/>}

    <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
    <p className="text-gray-700 mb-2">{product.description ?? "No description available"}</p>

    {renderPurchaseSection(product, forSale)}

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

    <div className="mt-6 pt-4">
      <h2 className="text-xl font-semibold mb-2">Product JSON</h2>
      <pre className="bg-gray-100 p-4 rounded border border-gray-300 text-sm text-gray-800">
        {JSON.stringify(product, null, 2)}
      </pre>
    </div>
    
  </div>
}
function renderPurchaseSection(product: Product, forSale: boolean) {
  if (forSale) {
    return (
      <div className="mt-6">
        <p className="text-lg font-semibold text-gray-800 mb-4">Price: ${product.listPrice.toFixed(2)}</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add to Cart
        </button>
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
