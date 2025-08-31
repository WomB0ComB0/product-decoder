/**
 * Copyright 2025 Product Decoder
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowUpRight, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [activeCard, setActiveCard] = useState("nutrition_facts");
  // const [hoverCard, setHoverCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FFF6E6] text-gray-900">
      {/* NAVIGATION HEADER */}
      <header className="py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <div>
            <Image
              src="/logo.png"
              alt="Product Decoder Logo"
              width={181}
              height={85}
              priority
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-12 text-xl font-semibold">
            <Link href="/" className="text-[#D26B36]">
              Home
            </Link>
            <Link href="#try" className="hover:text-[#D26B36]">
              Try out
            </Link>
            <SignedIn>
              <Link href="/upload" className="hover:text-[#D26B36]">
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <Link href="/login/" className="hover:text-[#D26B36]">
                Log In
              </Link>
            </SignedOut>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="px-6 mb-24">
        <div className="mx-auto max-w-7xl flex flex-col-reverse lg:flex-row items-center justify-between gap-16">
          {/* Left side: Headline, Description, Buttons */}
          <div className="max-w-xl">
            <p className="text-lg leading-relaxed text-gray-700">
              Upload any product photo and instantly get detailed information, pricing,
              nutrition facts, and where to buy. Powered by advanced visual recognition
              technology.
            </p>

            <div className="mt-10 flex items-center gap-10">
              <SignedIn>
                <Link
                  href="/upload"
                  className="bg-[#5D5FEF] text-white font-semibold px-6 py-3 rounded-md shadow-md flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Try Product Decoder
                </Link>
              </SignedIn>
              <SignedOut>
                <Link
                  // @ts-ignore
                  href="/login"
                  className="bg-[#5D5FEF] text-white font-semibold px-6 py-3 rounded-md shadow-md flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Try Product Decoder
                </Link>
              </SignedOut>

              <Button variant={`ghost`} className="text-gray-700 font-medium flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right side: Trading card */}
          <div className="bg-[#FFF6E6] p-6 rounded-2xl shadow-[0px_20px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-sm">
            <div className="rounded-xl overflow-hidden">
              <Image
                src="/ollie.png"
                alt="Ollie the Golden Retriever"
                width={500}
                height={500}
                className="rounded-xl"
              />
            </div>

            <div className="mt-4 text-sm">
              <p>
                <strong className="text-[#5D5FEF]">Name:</strong>{" "}
                <span className="text-[#6366F1]">Ollie the Golden Retriever</span>
              </p>
              <p>
                <strong className="text-[#5D5FEF]">Traits:</strong>{" "}
                <span className="text-[#6366F1]">Smart, Cute, Will Behave</span>
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <span className="bg-[#5D5FEF] text-white px-2 py-1 text-xs rounded-md">
                $FREE
              </span>
              <span className="bg-green-600 text-white px-2 py-1 text-xs rounded-md">
                In Stock
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-[#5A5CF0] py-20 px-6 container mx-auto rounded-xl">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">
            How it works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-white">
            {/* Image Upload */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/illustrations/htwdog1.png"
                alt="Image Upload"
                className="h-24 mb-6"
              />
              <h3 className="font-semibold text-lg mb-2">Image Upload</h3>
              <p className="text-sm text-[#E2E2FF] max-w-xs">
                Drag and drop or click to upload your product photo
              </p>
            </div>

            {/* Visual Search */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/illustrations/htwdog2.png"
                alt="Visual Search"
                className="h-24 mb-6"
              />
              <h3 className="font-semibold text-lg mb-2">Visual Search</h3>
              <p className="text-sm text-[#E2E2FF] max-w-xs">
                AI analyzes your image to find matching products
              </p>
            </div>

            {/* User Selection */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/illustrations/htwdog3.png"
                alt="User Selection"
                className="h-24 mb-6"
              />
              <h3 className="font-semibold text-lg mb-2">User Selection</h3>
              <p className="text-sm text-[#E2E2FF] max-w-xs">
                Choose the best match from our curated results
              </p>
            </div>

            {/* Metadata Extraction */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/illustrations/htwdog4.png"
                alt="Metadata Extraction"
                className="h-24 mb-6"
              />
              <h3 className="font-semibold text-lg mb-2">Metadata Extraction</h3>
              <p className="text-sm text-[#E2E2FF] max-w-xs">
                Extract relevant product data based on category
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POWERFUL FEATURES SECTION */}
      <section className="bg-[#FFF6E6] pt-32 pb-15 container mx-auto">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#5D5FEF] mb-16">
            Powerful features
          </h2>

          <div className="relative z-10 flex justify-center items-end gap-6 flex-wrap">
            {[
              { key: "nutrition_facts", label: "Nutrition Facts", color: "#5D5FEF" },
              { key: "price_history", label: "Price History", color: "#FDDC8B" },
              { key: "store_locations", label: "Store Locations", color: "#C25C2C" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveCard(key)}
                className={`rounded-t-xl px-6 py-3 font-semibold text-lg transition-all duration-300 focus:outline-none ${
                  activeCard === key
                    ? `text-white z-20 -mb-1`
                    : `opacity-80 z-10`
                }`}
                style={{
                  backgroundColor: activeCard === key ? color : "#EEE",
                  color: activeCard === key ? "white" : "#333",
                  transform: activeCard === key ? "scale(1.05)" : "scale(1)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom container that expands to full width and height */}
        <div
          className="mt-0 pt-20 pb-24 text-white text-center text-lg leading-relaxed px-6 rounded-xl"
          style={{
            backgroundColor:
              activeCard === "nutrition_facts"
                ? "#5D5FEF"
                : activeCard === "price_history"
                  ? "#FDDC8B"
                  : "#C25C2C",
          }}
        >
          {activeCard === "nutrition_facts" && (
            <p className="text-2xl font-medium">
              Get detailed nutritional information for food products including calories,
              ingredients, and allergens.
            </p>
          )}
          {activeCard === "price_history" && (
            <p className="text-2xl font-medium">
              Track price changes over time for electronics and fashion items to find the
              best deals.
            </p>
          )}
          {activeCard === "store_locations" && (
            <p className="text-2xl font-medium">
              Find nearby stores where you can purchase the product with real-time
              availability.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
