"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* Left: Logo + Contact + Socials */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <Link href="/" className="flex items-center group cursor-pointer">
                <span suppressHydrationWarning>
                  <Image
                    src="/logo.png"
                    alt="RaizMart Logo"
                    width={110}
                    height={110}
                  />
                </span>
              </Link>
              <p className="text-sm text-gray-600 max-w-xs">
                Your trusted marketplace for quality products across Bangladesh.
              </p>
            </div>
            <h3 className="text-gray-900 font-semibold mb-3">Contact</h3>
            <div className="space-y-4 flex flex-col sm:flex-row sm:gap-8 ">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#02C1BE] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  01608362979
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#02C1BE] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  support@raizmart.com
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Link
                href="https://www.facebook.com/share/1CubAbVr45/?mibextid=wwXIfr"
                className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#02C1BE] hover:bg-[#02C1BE]/5 text-gray-600 hover:text-[#02C1BE] flex items-center justify-center transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="https://www.instagram.com/raiz_mart?igsh=bjF0cDl6aHZ2MjB4&utm_source=qr"
                className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#02C1BE] hover:bg-[#02C1BE]/5 text-gray-600 hover:text-[#02C1BE] flex items-center justify-center transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right: Stores + Navigation */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-gray-900 font-semibold mb-3">Stores</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#02C1BE] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-gray-900 font-medium break-words">
                      West Kazipara, Central Masjid Gali, Mirpur, Dhaka-1216
                    </p>
                    <p className="text-sm text-gray-500 break-words">
                      House No- 679, 6th floor
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-3">Navigation</h3>
              <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-[#02C1BE] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  Home
                </Link>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-[#02C1BE] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  Blog
                </Link>
                <Link
                  href="/offers"
                  className="text-gray-600 hover:text-[#02C1BE] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  Offers
                </Link>
                <Link
                  href="/complain-advice"
                  className="text-gray-600 hover:text-[#02C1BE] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  Complain / Advice
                </Link>
                <Link
                  href="/#faq"
                  className="text-gray-600 hover:text-[#02C1BE] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  FAQ
                </Link>
                <a
                  href="https://wa.me/8801608362979?text=Hi, is there anyone to assist me?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#02C1BE] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  Contact us
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Developed by Quicktech */}
        <div className="flex justify-center sm:justify-end mt-8 sm:mt-0 md:mt-10 lg:mt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 w-full sm:w-auto">
            <Image
              src="/Quicktech_logo_1.png"
              alt="Quicktech Solutions"
              width={120}
              height={40}
              className="h-12 w-auto rounded-md"
            />
            <div className="flex items-start gap-2 flex-col text-center sm:text-left">
              <span className="text-sm text-gray-600">
                Developed by{" "}
                <span className="font-bold">Quicktech Solutions</span>
              </span>
              <div className="group flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <Link
                  href="https://www.facebook.com/quicktech5"
                  className="w-6 h-6 rounded-xl border border-gray-200 group-hover:border-[#02C1BE] group-hover:bg-[#02C1BE]/5 text-gray-600 group-hover:text-[#02C1BE] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link
                  href="https://www.facebook.com/quicktech5"
                  className="text-xs text-gray-600 group-hover:text-[#02C1BE] transition-colors cursor-pointer break-all sm:break-normal"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.facebook.com/quicktech5
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-2 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-sm text-gray-500">
          <p className="text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} RaizMart. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-center sm:text-left">
            <span>Support:</span>
            <a
              href="mailto:support@raizmart.com"
              className="text-gray-500 hover:text-[#02C1BE] transition-colors break-all sm:break-normal"
            >
              support@raizmart.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
