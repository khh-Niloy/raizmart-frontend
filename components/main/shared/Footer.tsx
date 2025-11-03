"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Three-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left: Logo + Contact + Socials */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/" className="flex items-center group cursor-pointer">
                <span suppressHydrationWarning>
                  <Image src="/logo.png" alt="RaizMart" width={110} height={110} />
                </span>
              </Link>
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">Your trusted marketplace for quality products</p>
              </div>
            </div>
            <h3 className="text-gray-900 font-semibold mb-3">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#02C1BE] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <Link href="tel:09678148148" className="text-gray-800 font-medium hover:text-[#02C1BE] cursor-pointer">09678148148</Link>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#02C1BE] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <Link href="mailto:support@raizmart.com" className="text-gray-800 font-medium hover:text-[#02C1BE] cursor-pointer">support@raizmart.com</Link>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <Link href="#" className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#02C1BE] hover:bg-[#02C1BE]/5 text-gray-600 hover:text-[#02C1BE] flex items-center justify-center transition-colors cursor-pointer">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#02C1BE] hover:bg-[#02C1BE]/5 text-gray-600 hover:text-[#02C1BE] flex items-center justify-center transition-colors cursor-pointer">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#02C1BE] hover:bg-[#02C1BE]/5 text-gray-600 hover:text-[#02C1BE] flex items-center justify-center transition-colors cursor-pointer">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Middle: Locations */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-3">Location</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#02C1BE] mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Bashundhara City Shopping Complex</p>
                  <p className="text-sm text-gray-500">Basement 2, Shop 26</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#02C1BE] mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Bashundhara City Shopping Complex</p>
                  <p className="text-sm text-gray-500">Level- 5, Block- A, Shop- 6, 7, 8</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#02C1BE] mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Jamuna Future Park</p>
                  <p className="text-sm text-gray-500">Level 4, Zone A (West Court), Shop 28D</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#02C1BE] mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">AG Care | Bashundhara City Shopping Complex</p>
                  <p className="text-sm text-gray-500">Level- 3, Block- B, Shop- 07</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Navigation */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-3">Navigation</h3>
            <nav className="grid grid-cols-1 gap-3 text-sm">
              <Link href="/about" className="text-gray-600 hover:text-[#02C1BE] transition-colors cursor-pointer">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-[#02C1BE] transition-colors cursor-pointer">Contact</Link>
              <Link href="/privacy-policy" className="text-gray-600 hover:text-[#02C1BE] transition-colors cursor-pointer">Privacy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-[#02C1BE] transition-colors cursor-pointer">Terms</Link>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} RaizMart. All rights reserved.</p>
          <div className="text-xs text-gray-500">
            <span className="mr-2">Support:</span>
            <Link href="mailto:support@raizmart.com" className="text-gray-600 hover:text-[#02C1BE] cursor-pointer">support@raizmart.com</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
