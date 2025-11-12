"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Gift,
  ArrowLeftRight,
  ShoppingCart,
} from "lucide-react";
import NavbarPofile from "./NavbarCompo/NavbarPofile";
import MegaMenu from "./MegaMenu";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import WishList from "./NavbarCompo/WishList";
import Cart from "./NavbarCompo/Cart";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useRouter } from "next/navigation";
import {
  useGetCategoriesQuery,
  useGetSubSubcategoriesQuery,
} from "@/app/redux/features/category-subcategory/category-subcategory.api";

export default function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  interface SearchItem {
    _id: string;
    name: string;
    slug: string;
    [key: string]: unknown;
  }

  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchMeta, setSearchMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>({ total: 0, page: 1, limit: 12, pages: 1 });
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      } catch (e: unknown) {
        if ((e as { name?: string })?.name !== "AbortError") {
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(
    new Set()
  );

  // Fetch categories for mobile menu
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery(undefined);
  const { data: subSubcategories } = useGetSubSubcategoriesQuery(undefined);

  interface Category {
    _id: string;
    name: string;
    slug: string;
    subcategories?: Subcategory[];
    [key: string]: unknown;
  }

  interface Subcategory {
    _id: string;
    name: string;
    slug: string;
    subSubcategories?: SubSubcategory[];
    [key: string]: unknown;
  }

  interface SubSubcategory {
    _id: string;
    name: string;
    slug?: string;
    subcategory?: string | { _id: string };
    [key: string]: unknown;
  }

  const categoriesList = Array.isArray(categories) ? (categories as Category[]) : [];
  const subSubcategoriesList = Array.isArray(subSubcategories)
    ? (subSubcategories as SubSubcategory[])
    : [];

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
          <div className="py-6 text-center text-gray-500 text-sm">
            Searching...
          </div>
        )}
        {!isSearching && searchItems.length === 0 && (
          <div className="py-6 text-center text-gray-500 text-sm">
            No products found
          </div>
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
                    (Array.isArray(p?.attributes) &&
                      p.attributes.find?.(
                        (a: {
                          name?: string;
                          values?: Array<{ images?: string[] }>;
                        }) => a.name?.toLowerCase?.() === "color"
                      )?.values?.[0]?.images?.[0]) ||
                    (Array.isArray(p?.images) && p.images[0]) ||
                    "/next.svg"
                  }
                  alt={p.name}
                  className="w-full h-28 object-contain mb-2"
                />
                <div className="text-sm text-gray-800 line-clamp-2 min-h-[2.5rem]">
                  {p.name}
                </div>
                <div className="mt-1 text-[#111827] font-semibold">
                  {Array.isArray(p?.variants) && p.variants[0]?.finalPrice
                    ? `৳${p.variants[0].finalPrice}`
                    : ""}
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
              onClick={() =>
                setSearchPage((p) => Math.min(searchMeta.pages, p + 1))
              }
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
                  <Image
                    src="/logo.png"
                    alt="RaizMart Logo"
                    width={90}
                    height={90}
                    suppressHydrationWarning
                  />
                </span>
              </Link>
            </div>

            {/* Center Section - Search Bar and Navigation */}
            <div className="flex-1 flex items-center justify-center px-4">
              {/* Search Bar */}
              <div className="w-full max-w-sm">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#02C1BE]/20 focus:border-[#02C1BE] transition-all duration-300 ${
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
              <div className="hidden lg:flex items-center space-x-6 ml-6">
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
        <div className="flex flex-col px-4 py-3 space-y-3 min-h-[112px]">
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

              <Link
                href="/"
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div className="relative h-10 w-auto">
                  <Image
                    src="/logo.png"
                    alt="RaizMart Logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                    priority
                    suppressHydrationWarning
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
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#02C1BE]/20 focus:border-[#02C1BE] transition-all duration-300"
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

        {/* Mobile Full-Screen Menu */}
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-[59] bg-black/50 transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => {
            setIsMobileMenuOpen(false);
            setExpandedCategories(new Set());
          }}
        />

        {/* Menu Panel */}
        <div
          className={`fixed inset-y-0 left-0 z-[60] bg-white flex flex-col w-full shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ top: 0, height: "100vh" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#02C1BE] to-[#01b1ae] text-white px-5 py-5 flex items-center justify-between flex-shrink-0 shadow-lg">
            <h2 className="text-xl font-bold tracking-tight">Main Menu</h2>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setExpandedCategories(new Set());
                setExpandedSubcategories(new Set());
              }}
              className="p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-all duration-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30">
              <div className="py-4">
                {/* Navigation Routes */}
                <div className="px-3 mb-2">
                  {navbarLinks.map((link, index) => {
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
                          className="w-full flex items-center px-5 py-3.5 text-gray-800 hover:bg-white hover:text-[#02C1BE] active:bg-[#02C1BE]/5 transition-all duration-200 font-medium text-left rounded-xl mb-1.5 group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center px-5 py-3.5 text-gray-800 hover:bg-white hover:text-[#02C1BE] active:bg-[#02C1BE]/5 transition-all duration-200 font-medium rounded-xl mb-1.5 group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="mx-5 my-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                {/* Categories */}
                {categoriesLoading ? (
                  <div className="px-5 py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                      <div className="w-5 h-5 border-2 border-[#02C1BE] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading categories...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-3">
                      {categoriesList.map((category: Category) => {
                      const categorySubcategories = category.subcategories || [];
                      const hasSubcategories = categorySubcategories.length > 0;
                      const isExpanded = expandedCategories.has(category._id);

                      const toggleCategory = () => {
                        setExpandedCategories((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(category._id)) {
                            newSet.delete(category._id);
                          } else {
                            newSet.add(category._id);
                          }
                          return newSet;
                        });
                      };

                      return (
                        <div key={category._id} className="mb-1.5">
                          {hasSubcategories ? (
                            <>
                              <button
                                onClick={toggleCategory}
                                className="w-full flex items-center justify-between px-5 py-3.5 text-gray-800 hover:bg-white hover:text-[#02C1BE] active:bg-[#02C1BE]/5 transition-all duration-200 font-medium text-left rounded-xl group"
                              >
                                <span className="whitespace-nowrap group-hover:translate-x-1 transition-transform duration-200">
                                  {category.name}
                                </span>
                                <div className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#02C1BE]" />
                                </div>
                              </button>

                              {/* Expanded Subcategories */}
                              {isExpanded && (
                                <div className="mt-1.5 ml-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                  {categorySubcategories.map(
                                    (subcategory: Subcategory) => {
                                      // Get sub-subcategories for this subcategory
                                      let subSubcategoriesForThisSub =
                                        subcategory.subSubcategories || [];

                                      if (
                                        subSubcategoriesForThisSub.length === 0 &&
                                        subSubcategoriesList.length > 0
                                      ) {
                                        subSubcategoriesForThisSub =
                                          subSubcategoriesList.filter(
                                            (subSub: SubSubcategory) => {
                                              if (
                                                typeof subSub.subcategory ===
                                                "string"
                                              ) {
                                                return (
                                                  subSub.subcategory ===
                                                  subcategory._id
                                                );
                                              } else if (
                                                subSub.subcategory &&
                                                typeof subSub.subcategory ===
                                                  "object" &&
                                                "_id" in subSub.subcategory
                                              ) {
                                                return (
                                                  subSub.subcategory._id ===
                                                  subcategory._id
                                                );
                                              }
                                              return false;
                                            }
                                          );
                                      }

                                      const hasSubSubcategories =
                                        subSubcategoriesForThisSub.length > 0;
                                      const isSubcategoryExpanded = expandedSubcategories.has(subcategory._id);

                                      const toggleSubcategory = () => {
                                        setExpandedSubcategories((prev) => {
                                          const newSet = new Set(prev);
                                          if (newSet.has(subcategory._id)) {
                                            newSet.delete(subcategory._id);
                                          } else {
                                            newSet.add(subcategory._id);
                                          }
                                          return newSet;
                                        });
                                      };

                                      return (
                                        <div key={subcategory._id}>
                                          {hasSubSubcategories ? (
                                            <button
                                              onClick={toggleSubcategory}
                                              className="w-full px-5 py-2.5 text-[#02C1BE] font-medium flex items-center justify-between border-b border-gray-100 last:border-b-0 hover:bg-[#02C1BE]/5 active:bg-[#02C1BE]/10 transition-all duration-200 group"
                                            >
                                              <span>{subcategory.name}</span>
                                              <div className="flex-shrink-0 transition-transform duration-300">
                                                {isSubcategoryExpanded ? (
                                                  <ChevronDown className="w-4 h-4 text-[#02C1BE]" />
                                                ) : (
                                                  <ChevronRight className="w-4 h-4 text-[#02C1BE]" />
                                                )}
                                              </div>
                                            </button>
                                          ) : (
                                            <Link
                                              href={`/category/${category.slug}/${subcategory.slug}`}
                                              onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                setExpandedCategories(new Set());
                                                setExpandedSubcategories(new Set());
                                              }}
                                              className="block px-5 py-2.5 text-[#02C1BE] hover:bg-[#02C1BE]/5 active:bg-[#02C1BE]/10 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                                            >
                                              {subcategory.name}
                                            </Link>
                                          )}

                                          {/* Sub-Subcategories */}
                                          {hasSubSubcategories && isSubcategoryExpanded && (
                                            <div className="pl-4 bg-white/50 animate-in slide-in-from-top-2 duration-200">
                                              {subSubcategoriesForThisSub.map(
                                                (subSubcategory: SubSubcategory) => {
                                                  const subSubcategorySlug =
                                                    subSubcategory.slug ||
                                                    subSubcategory.name
                                                      ?.toLowerCase()
                                                      .replace(/\s+/g, "-") ||
                                                    "sub-sub-category";
                                                  return (
                                                    <Link
                                                      key={subSubcategory._id}
                                                      href={`/category/${category.slug}/${subcategory.slug}/${subSubcategorySlug}`}
                                                      onClick={() => {
                                                        setIsMobileMenuOpen(
                                                          false
                                                        );
                                                        setExpandedCategories(
                                                          new Set()
                                                        );
                                                        setExpandedSubcategories(
                                                          new Set()
                                                        );
                                                      }}
                                                      className="block px-5 py-2.5 text-[#02C1BE] hover:bg-[#02C1BE]/5 active:bg-[#02C1BE]/10 transition-all duration-200 border-b border-gray-100/50 last:border-b-0"
                                                    >
                                                      {subSubcategory.name}
                                                    </Link>
                                                  );
                                                }
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <Link
                              href={`/category/${category.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="w-full flex items-center px-5 py-3.5 text-gray-800 hover:bg-white hover:text-[#02C1BE] active:bg-[#02C1BE]/5 transition-all duration-200 font-medium rounded-xl group"
                            >
                              <span className="whitespace-nowrap group-hover:translate-x-1 transition-transform duration-200">
                                {category.name}
                              </span>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                    </div>

                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation removed as per request */}
    </>
  );
}
