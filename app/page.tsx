"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductOverview, {ProductProps} from "@/components/ProductOverview";
import { callAuthenticatedApi, isEmployee, } from "@/common/utils/Auth";
import { addToCart } from "@/common/utils/CartManager";
import Navbar from "@/components/navbar/Navbar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import styled from "styled-components";
import SocialMedia from "@/components/buttons/SocialMedia";
import { getBaseURL } from "@/common/utils/BaseURL";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";


const ShimmeringH1 = styled.h1`
    background-image: linear-gradient(90deg, #93c5fd 0%, #d8b4fe 100%);
    -webkit-background-clip: text;
    background-clip: text;
    width: 1000px;
    color: transparent;
    animation: shineTitle 3s linear infinite;
    @keyframes shineTitle {
      0% {
        background-position: 0px;
      }
      100% {
        background-position: 1000px;
      }
    }
    @media (max-width: 1000px) {
      font-size: 7rem;
      width: 700px;
      letter-spacing: -8px;
    }
    @media (max-width: 700px) {
      font-size: 5rem;
      letter-spacing: -6px !important;
      width: 400px;
    }
  `;

export default function Discover() {

  
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -100]);


  const refreshCart = () => {
    setRefreshKey(prev => (prev + 1) % 1000);
  }

  const addToCartCallback = ((productId: number, name: string, listPrice: number, quantity: number) => {
      console.log("Adding to cart:", productId, quantity);
      addToCart({productId: productId, name: name, listPrice: listPrice}, quantity);
      refreshCart();
  })

  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams({
          page: "1",
          pageSize: "9",
          sortNewest: "true",
          onlyWithPhotos: "true"
        });

        const res = await fetch(`${getBaseURL()}/api/products?${params.toString()}`, {
          method: "GET",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProducts(data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="px-6 py-3 flex flex-col gap-8">
      <Navbar refreshKey={refreshKey}>
        <h1 className="text-2xl font-bold min-h-full text-center">Product Discovery</h1>
      </Navbar>

      <div ref={heroRef} className="relative w-full h-[600px]">
        <motion.div style={{y}}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Image
            src="https://i.natgeofe.com/n/1ac334a0-ac4e-4745-a292-169b0a349e8b/grand-peaks-mount-cook.jpg"
            alt="Discover Banner"
            width={3000}
            height={2000}
            priority
            quality={100}
            className="w-full h-[600px] object-cover rounded-lg shadow-md object-[center_20%]"
          />
        </motion.div>

        {/* Overlayed Text */}
        <div className="left-2/5 absolute inset-0 flex flex-col items-center justify-center gap-1">
          <motion.div className="flex flex-col items-center justify-center gap-1"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}>
            <h1 className="text-white text-7xl font-bold drop-shadow-2xl">
            Discover the Peaks
            </h1>
            <h1 className="text-white text-7xl font-bold drop-shadow-2xl">
              Discover the World
            </h1>
            <h1 className="text-white text-8xl font-bold drop-shadow-2xl text-center">
              Adventure Works
            </h1>
          </motion.div>
          
        </div>
      </div>


      <div className="flex flex-col items-center justify-center w-full">
        <motion.div
          className="text-6xl font-bold mb-10 text-center"
          viewport={{once: true}}
          transition={{ duration: 0.5 }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{opacity: 1, y: 0}}
        >
          <ShimmeringH1>Discover New Gear</ShimmeringH1>
          
        </motion.div>

        {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
          <div className="w-full relative flex flex-col items-center justify-center">
            {/* Top-right "View More Products" link */}
            <div className="absolute right-52 top-0">
              <a
                href="/products"
                className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 transition-transform hover:translate-x-1"
              >
                View More Products
                <span aria-hidden>→</span>
              </a>
            </div>

            <Carousel className="relative w-full px-5 mx-5 max-w-10/12 mt-6">
              <CarouselContent>
                {products.map((product, i) => (
                  <CarouselItem
                    key={product.productId}
                    className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 p-3"
                  >
                    <motion.div
                      key={product.productId}
                      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer mute"
                      viewport={{once: true}}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, rotateZ: 0.5 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <ProductOverview
                        
                        className="bg-gray-100 hover:bg-white transition-all duration-200"
                        key={product.productId}
                        {...product}
                        isEmployee={isEmployee()}
                        addToCartCallback={addToCartCallback}
                      />
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          )}
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        <motion.div
          className="text-6xl font-bold mb-10 text-center"
          viewport={{once: true}}
          transition={{ duration: 0.5 }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{opacity: 1, y: 0}}
        >
          <ShimmeringH1>Customer Favorites</ShimmeringH1>
          
        </motion.div>

        {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
          <div className="w-full relative flex flex-col items-center justify-center">
            {/* Top-right "View More Products" link */}
            <div className="absolute right-52 top-0">
              <a
                href="/products"
                className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 transition-transform hover:translate-x-1"
              >
                View More Products
                <span aria-hidden>→</span>
              </a>
            </div>

            <Carousel className="relative w-full px-5 mx-5 max-w-10/12 mt-6">
              <CarouselContent>
                {products.map((product, i) => (
                  <CarouselItem
                    key={product.productId}
                    className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 p-3"
                  >
                    <motion.div
                      key={product.productId}
                      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer mute"
                      viewport={{once: true}}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, rotateZ: 0.5 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <ProductOverview
                        
                        className="bg-gray-100 hover:bg-white transition-all duration-200"
                        key={product.productId}
                        {...product}
                        isEmployee={isEmployee()}
                        addToCartCallback={addToCartCallback}
                      />
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          )}
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        <motion.div
          className="text-6xl font-bold mb-10 text-center"
          viewport={{once: true}}
          transition={{ duration: 0.5 }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{opacity: 1, y: 0}}
        >
          <ShimmeringH1>Best Value</ShimmeringH1>
          
        </motion.div>

        {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
          <div className="w-full relative flex flex-col items-center justify-center">
            {/* Top-right "View More Products" link */}
            <div className="absolute right-52 top-0">
              <a
                href="/products"
                className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 transition-transform hover:translate-x-1"
              >
                View More Products
                <span aria-hidden>→</span>
              </a>
            </div>

            <Carousel className="relative w-full px-5 mx-5 max-w-10/12 mt-6">
              <CarouselContent>
                {products.map((product, i) => (
                  <CarouselItem
                    key={product.productId}
                    className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 p-3"
                  >
                    <motion.div
                      key={product.productId}
                      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer mute"
                      viewport={{once: true}}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, rotateZ: 0.5 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <ProductOverview
                        
                        className="bg-gray-100 hover:bg-white transition-all duration-200"
                        key={product.productId}
                        {...product}
                        isEmployee={isEmployee()}
                        addToCartCallback={addToCartCallback}
                      />
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          )}
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        <motion.div
          className="text-6xl font-bold mb-10 text-center"
          viewport={{once: true}}
          transition={{ duration: 0.5 }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{opacity: 1, y: 0}}
          
        >
          <ShimmeringH1>Follow us on Social Media</ShimmeringH1>
          
        </motion.div>

        <motion.div className="flex flex-row gap-2"
          viewport={{once: true}}
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          transition={{ type: "spring", stiffness: 200, duration: 0.5 }}
          >
          <SocialMedia href={""} text={"@adventureworks"} icon={"/instagramlogo.svg"} className="w-60 h-60" icon_scale={5}/>
          <SocialMedia href={""} text={"@adventureworks"} icon={"/twitterlogo.svg"} className="w-60 h-60" icon_scale={5}/>

        </motion.div>

        <div className="mb-11">

        </div>
      </div>
      

      
    </div>
  );
}
