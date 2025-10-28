"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X, User, Heart, Bell } from "lucide-react";
import NavbarPofile from "./NavbarCompo/NavbarPofile";
import MegaMenu from "./MegaMenu";
import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";

export default function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initialNavbarLinks = [
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Offers",
      href: "/offers",
    },
  ];

  const { data: userInfo } = useUserInfoQuery(undefined);

  const navbarLinks =
    userInfo?.role === "ADMIN"
      ? [
          ...initialNavbarLinks,
          { label: "Dashboard", href: "/admin/dashboard" },
        ]
      : initialNavbarLinks;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-15">
          <div className="flex items-center h-16">
            {/* Logo Section - Left */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <span suppressHydrationWarning>
                  <Image src="/logo.png" alt="RaizMart" width={90} height={90} />
                </span>
              </Link>
            </div>

            {/* Center Section - Search Bar and Navigation */}
            <div className="flex-1 flex items-center justify-center px-4">
              {/* Search Bar */}
              <div className="w-full max-w-md">
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
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                </div>
              </div>

              {/* Additional Navigation Links */}
              <div className="hidden xl:flex items-center space-x-6 ml-6">
                {navbarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-[#02C1BE] transition-colors duration-200 font-medium relative group"
                  >
                    <span>{link.label}</span>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#02C1BE] transition-all duration-200 group-hover:w-full"></div>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Actions - Right */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="flex items-center space-x-2 p-2.5 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200"
              >
                <Heart className="h-5 w-5" />
                <span className="hidden lg:block text-sm font-medium">Wishlist</span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="flex items-center space-x-2 p-2.5 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden lg:block text-sm font-medium">Cart</span>
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#02C1BE] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {cartItems}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <NavbarPofile />
            </div>
          </div>
        </div>
      </nav>

      {/* Fixed Category Navigation Bar */}
      <div className="hidden lg:block fixed top-16 left-0 right-0 z-40 bg-[#02c1be]">
        <div className="max-w-full mx-auto px-4 py-1 sm:px-6 lg:px-15">
          <MegaMenu />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
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

            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div className="flex flex-col">
                <span className="text-orange-600 font-bold text-sm">
                  RaizMart
                </span>
                <span className="text-gray-500 text-xs">Premium Store</span>
              </div>
            </Link>
          </div>

          {/* Mobile Search Bar */}
          <div className="flex-1 mx-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-1">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 rounded-xl transition-all duration-200"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#02C1BE] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Link>

            {/* Profile */}
            <NavbarPofile />
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg transition-all duration-300 ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="py-4 space-y-1">
            {navbarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-3 text-gray-700 hover:text-[#02C1BE] hover:bg-[#02C1BE]/10 transition-all duration-200 font-medium py-3 px-4 rounded-lg mx-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 bg-[#02C1BE] rounded-full"></div>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Mobile User Actions */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex items-center justify-around px-4">
                <Link
                  href="/wishlist"
                  className="flex flex-col items-center space-y-1 py-2 text-gray-600 hover:text-[#02C1BE] transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  <span className="text-xs">Wishlist</span>
                </Link>

                <Link
                  href="/notifications"
                  className="flex flex-col items-center space-y-1 py-2 text-gray-600 hover:text-[#02C1BE] transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Bell className="h-5 w-5" />
                  <span className="text-xs">Alerts</span>
                </Link>

                <Link
                  href="/cart"
                  className="flex flex-col items-center space-y-1 py-2 text-gray-600 hover:text-[#02C1BE] transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#02C1BE] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {cartItems}
                      </span>
                    )}
                  </div>
                  <span className="text-xs">Cart</span>
                </Link>

                <div onClick={() => setIsMobileMenuOpen(false)}>
                  <NavbarPofile />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {/* Home */}
          <Link
            href="/"
            className="flex flex-col items-center space-y-1 py-2 px-3 rounded-xl hover:bg-[#02C1BE]/10 transition-all duration-200"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-[#02C1BE] to-[#02C1BE]/80 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-[#02C1BE] text-xs font-medium">Home</span>
          </Link>

          {/* Category */}
          <Link
            href="/category"
            className="flex flex-col items-center space-y-1 py-2 px-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <span className="text-gray-500 text-xs">Category</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="flex flex-col items-center space-y-1 py-2 px-3 rounded-xl hover:bg-[#02C1BE]/10 transition-all duration-200"
          >
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-gray-500 text-xs">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex flex-col items-center space-y-1 py-2 px-3 rounded-xl hover:bg-[#02C1BE]/10 transition-all duration-200 relative"
          >
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-gray-600" />
            </div>
            {cartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#02C1BE] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartItems}
              </span>
            )}
            <span className="text-gray-500 text-xs">Cart</span>
          </Link>

          {/* Profile */}
          <div className="flex flex-col items-center space-y-1 py-2 px-3 rounded-xl hover:bg-[#02C1BE]/10 transition-all duration-200">
            <NavbarPofile />
          </div>
        </div>
      </div>
    </>
  );
}
