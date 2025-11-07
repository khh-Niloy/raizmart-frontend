"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import NavbarPofile from "./NavbarCompo/NavbarPofile";
import MegaMenu from "./MegaMenu";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import WishList from "./NavbarCompo/WishList";
import Cart from "./NavbarCompo/Cart";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchItems, setSearchItems] = useState<any[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchMeta, setSearchMeta] = useState<{ total: number; page: number; limit: number; pages: number }>({ total: 0, page: 1, limit: 12, pages: 1 });
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<any>(null);

  // Debounced search effect
  useEffect(() => {
    if (!isSearchOpen || !searchQuery.trim()) {
      setSearchItems([]);
      setSearchMeta({ total: 0, page: 1, limit: 12, pages: 1 });
      if (searchAbortRef.current) searchAbortRef.current.abort();
      return;
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        if (searchAbortRef.current) searchAbortRef.current.abort();
        const ctrl = new AbortController();
        searchAbortRef.current = ctrl;
        const qs = new URLSearchParams({
          q: searchQuery.trim(),
          page: String(searchPage),
          limit: "12",
          sort: "newest",
        }).toString();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}products/search?${qs}`,
          { signal: ctrl.signal, cache: "no-store" }
        );
        const json = await res.json();
        setSearchItems(json?.items || []);
        setSearchMeta(json?.meta || { total: 0, page: 1, limit: 12, pages: 1 });
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          // ignore network errors for UX; keep prior results
        }
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [isSearchOpen, searchQuery, searchPage]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initialNavbarLinks = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Offers",
      href: "/offers",
    },
    {
      label: "Orders",
      href: "/profile/orders",
    },
  ];

  const { data: userInfo } = useUserInfoQuery(undefined);
  // console.log("userInfo", userInfo);
  const { openAuth } = useAuthGate();
  const router = useRouter();

  const handleOrdersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userInfo) {
      router.push("/profile/orders");
    } else {
      openAuth();
    }
  };

  const navbarLinks =
    userInfo?.role === "ADMIN"
      ? [
          ...initialNavbarLinks,
          { label: "Dashboard", href: "/admin/dashboard" },
        ]
      : initialNavbarLinks;

  const renderSearchDropdown = (wrapperClass: string) => (
    <div className={wrapperClass}>
      <div className="p-3">
        {isSearching && (
          <div className="py-6 text-center text-gray-500 text-sm">Searching...</div>
        )}
        {!isSearching && searchItems.length === 0 && (
          <div className="py-6 text-center text-gray-500 text-sm">No products found</div>
        )}
        {!isSearching && searchItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {searchItems.map((p) => (
              <Link
                key={p._id}
                href={`/product/${p.slug}`}
                className="border rounded-lg p-3 bg-white hover:shadow transition-shadow"
                onClick={() => {
                  setIsSearchOpen(false);
                  setIsSearchFocused(false);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    (p?.attributes?.find?.((a: any) => a.name?.toLowerCase?.() === "color")?.values?.[0]?.images?.[0]) ||
                    p?.images?.[0] ||
                    "/next.svg"
                  }
                  alt={p.name}
                  className="w-full h-28 object-contain mb-2"
                />
                <div className="text-sm text-gray-800 line-clamp-2 min-h-[2.5rem]">{p.name}</div>
                <div className="mt-1 text-[#111827] font-semibold">
                  {p?.variants?.[0]?.finalPrice ? `৳${p.variants[0].finalPrice}` : ""}
                </div>
              </Link>
            ))}
          </div>
        )}
        {/* Pagination controls */}
        {!isSearching && searchMeta.pages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              disabled={searchPage <= 1}
              onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <div className="text-xs text-gray-500">
              Page {searchMeta.page} of {searchMeta.pages}
            </div>
            <button
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
              disabled={searchPage >= searchMeta.pages}
              onClick={() => setSearchPage((p) => Math.min(searchMeta.pages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-15 py-2">
          <div className="flex items-center h-16">
            {/* Logo Section - Left */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center group cursor-pointer">
                <span suppressHydrationWarning>
                  <Image src="/logo.png" alt="RaizMart" width={90} height={90} />
                </span>
              </Link>
            </div>

            {/* Center Section - Search Bar and Navigation */}
            <div className="flex-1 flex items-center justify-center px-4">
              {/* Search Bar */}
              <div className="w-full max-w-xs">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#02C1BE]/20 focus:border-[#02C1BE] transition-all duration-300 ${
                      isSearchFocused
                        ? "bg-white shadow-lg shadow-[#02C1BE]/10 border-[#02C1BE]"
                        : "hover:bg-gray-100"
                    }`}
                    value={searchQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearchQuery(v);
                      setSearchPage(1);
                      setIsSearchOpen(!!v.trim());
                    }}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      if (searchQuery.trim()) setIsSearchOpen(true);
                    }}
                    onBlur={() => {
                      // small delay to allow click in dropdown
                      setTimeout(() => setIsSearchOpen(false), 150);
                      setIsSearchFocused(false);
                    }}
                  />
                  {/* Results dropdown */}
                  {isSearchOpen &&
                    renderSearchDropdown(
                      "absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
                    )}
                </div>
              </div>

              {/* Additional Navigation Links */}
              <div className="hidden xl:flex items-center space-x-6 ml-6">
                {navbarLinks.map((link) => {
                  // Special handling for Orders link
                  if (link.href === "/profile/orders") {
                    return (
                      <button
                        key={link.href}
                        onClick={handleOrdersClick}
                        className="text-gray-700 hover:text-[#02C1BE] transition-colors duration-200 font-medium relative group"
                      >
                        <span>{link.label}</span>
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#02C1BE] transition-all duration-200 group-hover:w-full"></div>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gray-700 hover:text-[#02C1BE] transition-colors duration-200 font-medium relative group"
                    >
                      <span>{link.label}</span>
                      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#02C1BE] transition-all duration-200 group-hover:w-full"></div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Actions - Right */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Wishlist */}
              <WishList />

              {/* Cart */}
              <Cart />

              {/* Profile */}
              <NavbarPofile />
            </div>
          </div>
        </div>
      </nav>

      {/* Fixed Category Navigation Bar */}
      <div className="hidden lg:block fixed top-20 left-0 right-0 z-40 bg-[#02c1be]">
        <div className="max-w-full mx-auto px-4 py-1 sm:px-6 lg:px-15">
          <MegaMenu />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex flex-col px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            {/* Mobile Hamburger & Logo */}
            <div className="flex items-center space-x-3">
              <button
                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              <Link href="/" className="flex items-center space-x-2 cursor-pointer">
                <div className="relative h-10 w-auto">
                  <Image
                    src="/logo.png"
                    alt="RaizMart"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-end gap-2">
              <WishList />
              <Cart />
              <div className="flex flex-col items-center">
                <NavbarPofile />
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#02C1BE]/20 focus:border-[#02C1BE] transition-all duration-300"
              value={searchQuery}
              onChange={(e) => {
                const v = e.target.value;
                setSearchQuery(v);
                setSearchPage(1);
                setIsSearchOpen(!!v.trim());
              }}
              onFocus={() => {
                setIsSearchFocused(true);
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              onBlur={() => {
                setTimeout(() => setIsSearchOpen(false), 150);
                setIsSearchFocused(false);
              }}
            />
            {isSearchOpen &&
              renderSearchDropdown(
                "absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
              )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg transition-all duration-300 ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="py-4 space-y-1">
            {navbarLinks.map((link) => {
              // Special handling for Orders link
              if (link.href === "/profile/orders") {
                return (
                  <button
                    key={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      handleOrdersClick(e);
                    }}
                    className="flex items-center space-x-3 text-gray-700 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 transition-all duration-200 font-medium py-3 px-4 rounded-lg mx-2 w-full text-left"
                  >
                    <div className="w-2 h-2 bg-[#02C1BE] rounded-full"></div>
                    <span>{link.label}</span>
                  </button>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-3 text-gray-700 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 transition-all duration-200 font-medium py-3 px-4 rounded-lg mx-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-[#02C1BE] rounded-full"></div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation removed as per request */}
    </>
  );
}
