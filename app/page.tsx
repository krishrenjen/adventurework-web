export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen w-full">
      {/* AdventureWorks Product Lookup */}
      <h1 className="text-2xl font-bold mb-6">AdventureWorks Product Lookup</h1>
      <p className="mb-4">
        This is a simple product lookup application for AdventureWorks.
      </p>
      {/* Go to /products */}
      <p className="mb-4">
        To get started, go to the <a href="/products" className="text-blue-600 hover:underline">Products</a> page.
      </p>
    </div>
  );
}
